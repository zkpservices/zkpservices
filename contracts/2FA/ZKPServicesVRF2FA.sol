pragma solidity ^0.8.7;

import "../interfaces/IVRF.sol";
import "../interfaces/IGroth16VerifierP2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract ZKPServicesVRF2FA is Ownable, AutomationCompatibleInterface {
    IVRF private vrf;
    IGroth16VerifierP2 private responseVerifier;
    IGroth16VerifierP2 private passwordChangeVerifier;
    // this contract helps expedite sign up to zkp.services via batched calls
    address public batchSignUpContractAddress;

    struct TwoFactorData {
        bool success;
        uint256 timestamp;
    }

    mapping(uint256 => TwoFactorData) public twoFactorData; // 2FA ID => (boolean indicating success, timestamp, expired)
    mapping(uint256 => bytes32) public oneTimeKeyHashes; // 2FA ID => hash of one time key for 2FA request
    mapping(address => uint256) public userSecrets; // address => hash of 2FA secret/password
    mapping(uint256 => address) private requesters; // 2FA ID => address of the requester

    // 50 blocks *~2 second finality => valid random number to prove timeliness trustlessly
    // for all 2FA requests for ~100 seconds
    uint256 public WINDOW_SIZE = 50;
    mapping(uint256 => bool) public windowVRFRequestRequired; // determine if a random number is needed for a window
    mapping(uint256 => bool) public windowVRFRequested; // determine if a random number has been requested for a window
    mapping(uint256 => uint256) public windowToVRFRequestIds; // map window number to VRF request IDs
    mapping(uint256 => uint256) public _2FARequestIdsToWindow; // map 2FA request IDs (not VRF) to window numbers

    constructor(
        address _vrfAddress,
        address _vrf2FAResponseVerifierAddress,
        address _vrf2FAPasswordChangeVerifierAddress
    ) Ownable(msg.sender) {
        vrf = IVRF(_vrfAddress);
        responseVerifier = IGroth16VerifierP2(_vrf2FAResponseVerifierAddress);
        passwordChangeVerifier = IGroth16VerifierP2(
            _vrf2FAPasswordChangeVerifierAddress
        );
    }

    function setWindowSize(uint256 _window) public onlyOwner {
        WINDOW_SIZE = _window;
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        uint256 currentWindow = block.number / WINDOW_SIZE;
        uint256 priorWindow = currentWindow - 1;
        upkeepNeeded = ((!windowVRFRequested[currentWindow] &&
            windowVRFRequestRequired[currentWindow]) ||
            (!windowVRFRequested[priorWindow] &&
                windowVRFRequestRequired[priorWindow]));
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        uint256 currentWindow = block.number / WINDOW_SIZE;
        uint256 priorWindow = currentWindow - 1;

        // prevent block overlap problem
        // example: with a WINDOW_SIZE of 50, a request for a random number is made at block 50
        // but the minimum block height difference to generate a VRF + to trigger chainlink
        // automation would only make it available at block 50 + vrf_difference + trigger_difference
        // meaning it would only be available in the next window
        // vrf_difference + trigger_difference is assumed to be roughly 5-6 blocks at most, thus
        // maintaining a WINDOW_SIZE of 10 or more is very reasonable and ensuring both the
        // prior window and the current window have an assigned VRF in cases of overlap is sufficient
        if (
            !windowVRFRequested[priorWindow] &&
            windowVRFRequestRequired[priorWindow]
        ) {
            windowToVRFRequestIds[priorWindow] = vrf.requestRandomWords();
            windowVRFRequested[priorWindow] = true;
        }

        if (
            !windowVRFRequested[currentWindow] &&
            windowVRFRequestRequired[currentWindow]
        ) {
            windowToVRFRequestIds[currentWindow] = vrf.requestRandomWords();
            windowVRFRequested[currentWindow] = true;
        }
    }

    function generate2FA(uint256 _id, bytes32 _oneTimeKeyHash) external {
        require(twoFactorData[_id].timestamp == 0, "2FA ID already used");
        oneTimeKeyHashes[_id] = _oneTimeKeyHash;
        twoFactorData[_id] = TwoFactorData({
            success: false,
            timestamp: block.timestamp
        });
    }

    function requestRandomNumber(uint256 _id, string memory _oneTimeKey)
        external
    {
        require(
            oneTimeKeyHashes[_id] == keccak256(bytes(_oneTimeKey)),
            "Invalid one-time key"
        );
        require(
            requesters[_id] == address(0),
            "Random number already requested"
        );

        _2FARequestIdsToWindow[_id] = block.number / WINDOW_SIZE;
        requesters[_id] = msg.sender;
        windowVRFRequestRequired[block.number / WINDOW_SIZE] = true;
    }

    function getRandomNumber(uint256 _id) public view returns (uint256) {
        uint256 requestId = windowToVRFRequestIds[_2FARequestIdsToWindow[_id]];
        (bool fulfilled, uint256[] memory randomWords) = vrf.getRequestStatus(
            requestId
        );
        require(fulfilled, "Random words not yet fulfilled");
        require(randomWords.length > 0, "No random words returned");

        uint224 truncatedRandomNumber = uint224(randomWords[0]); // Truncate to 224 bits
        return uint256(truncatedRandomNumber); // Convert back to uint256
    }

    struct ProofParameters {
        uint256 pA0;
        uint256 pA1;
        uint256 pB00;
        uint256 pB01;
        uint256 pB10;
        uint256 pB11;
        uint256 pC0;
        uint256 pC1;
        uint256 pubSignals0;
        uint256 pubSignals1;
    }

    function verifyProof(
        uint256 _id,
        uint256 _randomNumber,
        uint256 _userSecretHash,
        ProofParameters memory params
    ) public {
        require(msg.sender == requesters[_id], "Unauthorized");
        require(userSecrets[msg.sender] != 0, "User secret has not been set");

        uint256 randomNumber = getRandomNumber(_id);
        require(randomNumber == _randomNumber, "Invalid random number");
        require(
            userSecrets[msg.sender] == _userSecretHash,
            "Invalid user secret"
        );
        require(
            params.pubSignals0 == _randomNumber,
            "Public signal for random number mismatch"
        );
        require(
            params.pubSignals1 == _userSecretHash,
            "Public signal for user secret hash mismatch"
        );

        uint256[2] memory pA = [params.pA0, params.pA1];
        uint256[2][2] memory pB = [[params.pB00, params.pB01], [params.pB10, params.pB11]];
        uint256[2] memory pC = [params.pC0, params.pC1];
        uint256[2] memory pubSignals = [params.pubSignals0, params.pubSignals1];

        bool proofVerified = responseVerifier.verifyProof(pA, pB, pC, pubSignals);
        require(proofVerified, "Invalid proof");

        twoFactorData[_id].success = true;
        twoFactorData[_id].timestamp = block.timestamp;
    }

    function setBatchSignUpContractAddress(address _batchSignUpContractAddress)
        public
        onlyOwner
    {
        require(
            batchSignUpContractAddress == address(0),
            "Batch Sign Up contract address already set"
        );
        batchSignUpContractAddress = _batchSignUpContractAddress;
    }

    // User method to store initialize 2FA secret
    function setSecret(uint256 _userSecretHash) external {
        require(
            userSecrets[msg.sender] == 0,
            "User secret already set, use updateSecret instead"
        );
        userSecrets[msg.sender] = _userSecretHash;
    }

    function setSecretBatchSignUpContractAddress(
        uint256 _userSecretHash,
        address userAddress
    ) external {
        require(msg.sender == batchSignUpContractAddress);
        require(
            userSecrets[userAddress] == 0,
            "User secret already set, use updateSecret instead"
        );
        userSecrets[userAddress] = _userSecretHash;
    }

    // Method for users to update their 2FA secret.
    // A Zero-Knowledge Proof (ZKP) is required to ensure secure secret update.
    // If a user's account is compromised, the ZKP prevents the attacker from updating the user's secret without knowledge of the existing secret.
    // Thus, ZKP provides an extra layer of security and privacy to users during secret update, making the process robust against potential attacks.
    function updateSecret(
        uint256 _oldSecretHash,
        uint256 _newSecretHash,
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[2] calldata _pubSignals
    ) external {
        require(_pubSignals.length == 2, "Invalid public signals length");
        require(
            userSecrets[msg.sender] == _oldSecretHash,
            "Invalid old secret"
        );
        require(
            _pubSignals[0] == _oldSecretHash,
            "Public signal for old secret hash mismatch"
        );
        require(
            _pubSignals[1] == _newSecretHash,
            "Public signal for new secret hash mismatch"
        );

        bool proofVerified = passwordChangeVerifier.verifyProof(
            _pA,
            _pB,
            _pC,
            _pubSignals
        );
        require(proofVerified, "Invalid proof");

        // update the user's secret
        userSecrets[msg.sender] = _newSecretHash;
    }
}
