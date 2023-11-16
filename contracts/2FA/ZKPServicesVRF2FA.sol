pragma solidity ^0.8.7;

import "../interfaces/IVRF.sol";
import "../interfaces/IGroth16VerifierP2.sol";

contract ZKPServicesVRF2FA {
    IVRF private vrf;
    IGroth16VerifierP2 private responseVerifier;
    IGroth16VerifierP2 private passwordChangeVerifier;

    struct TwoFactorData {
        bool success;
        uint256 timestamp;
    }

    mapping(uint256 => TwoFactorData) public twoFactorData; // 2FA ID => (boolean indicating success, timestamp, expired)
    mapping(uint256 => bytes32) public oneTimeKeyHashes; // 2FA ID => hash of one time key for 2FA request
    mapping(address => uint256) public userSecrets; // address => hash of 2FA secret/password
    mapping(uint256 => uint256) public requestIds; // 2FA ID => VRF request ID
    mapping(uint256 => address) private requesters; // 2FA ID => address of the requester

    constructor(
        address _vrfAddress,
        address _vrf2FAResponseVerifierAddress,
        address _vrf2FAPasswordChangeVerifierAddress
    ) {
        vrf = IVRF(_vrfAddress);
        responseVerifier = IGroth16VerifierP2(_vrf2FAResponseVerifierAddress);
        passwordChangeVerifier = IGroth16VerifierP2(
            _vrf2FAPasswordChangeVerifierAddress
        );
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

        uint256 requestId = vrf.requestRandomWords(); // Call the VRF contract
        requestIds[_id] = requestId; // Store the request ID
        requesters[_id] = msg.sender;
    }

    function getRandomNumber(uint256 _id) public view returns (uint256) {
        uint256 requestId = requestIds[_id];
        (bool fulfilled, uint256[] memory randomWords) = vrf.getRequestStatus(
            requestId
        );
        require(fulfilled, "Random words not yet fulfilled");
        require(randomWords.length > 0, "No random words returned");

        uint224 truncatedRandomNumber = uint224(randomWords[0]); // Truncate to 224 bits
        return uint256(truncatedRandomNumber); // Convert back to uint256
    }

    function verifyProof(
        uint256 _id,
        uint256 _randomNumber,
        uint256 _userSecretHash,
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[2] calldata _pubSignals
    ) public {
        require(msg.sender == requesters[_id], "Unauthorized");
        require(userSecrets[msg.sender] != 0, "User secret has not been set");
        require(_pubSignals.length == 2, "Invalid public signals length");

        // Get the truncated random number from VRF
        uint256 randomNumber = getRandomNumber(_id);
        require(randomNumber == _randomNumber, "Invalid random number");
        require(
            userSecrets[msg.sender] == _userSecretHash,
            "Invalid user secret"
        );
        require(
            _pubSignals[0] == _randomNumber,
            "Public signal for random number mismatch"
        );
        require(
            _pubSignals[1] == _userSecretHash,
            "Public signal for user secret hash mismatch"
        );

        bool proofVerified = responseVerifier.verifyProof(
            _pA,
            _pB,
            _pC,
            _pubSignals
        );
        require(proofVerified, "Invalid proof");

        twoFactorData[_id].success = true;
        twoFactorData[_id].timestamp = block.timestamp;
    }

    // User method to store initialize 2FA secret
    function setSecret(uint256 _userSecretHash) external {
        require(
            userSecrets[msg.sender] == 0,
            "User secret already set, use updateSecret instead"
        );
        userSecrets[msg.sender] = _userSecretHash;
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
