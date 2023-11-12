pragma solidity ^0.8.7;

import "./vrf.sol";
import "./verifiers/twofactor.sol";

contract twofactor {

    vrf private VRF;
    Groth16Verifier private verifier;

    struct TwoFactorData {
        bool success;
        uint256 timestamp;
    }

    mapping(uint256 => TwoFactorData) public twoFactorData; // 2FA ID => (boolean indicating success, timestamp, expired)
    mapping(uint256 => bytes32) public oneTimeKeyHashes; // 2FA ID => hash of one time key for 2FA request
    mapping(address => bytes32) public userSecrets; // address => hash of 2FA secret/password
    mapping(uint256 => uint256) public requestIds; // 2FA ID => VRF request ID
    mapping(uint256 => uint256) public randomNumbers; // 2FA ID => random number
    mapping(uint256 => address) private requesters; // 2FA ID => address of the requester

    constructor(address _vrfAddress, address _verifierAddress) { 
        VRF = vrf(_vrfAddress);
        verifier = Groth16Verifier(_verifierAddress); 
    }

    function generate2FA(uint256 _id, bytes32 _oneTimeKeyHash) external {
        require(twoFactorData[_id].timestamp == 0, "2FA ID already used");
        oneTimeKeyHashes[_id] = _oneTimeKeyHash;
        twoFactorData[_id] = TwoFactorData({ success: false, timestamp: block.timestamp});
    }

    function requestRandomNumber(uint256 _id, bytes calldata _oneTimeKey) external {
        require(oneTimeKeyHashes[_id] == keccak256(_oneTimeKey), "Invalid one-time key");
        require(requesters[_id] == address(0), "Random number already requested");

        uint256 requestId = VRF.requestRandomWords(); // Call the VRF contract
        requestIds[_id] = requestId; // Store the request ID
        requesters[_id] = msg.sender;
    }

    function getRandomWords(uint256 _id) public view returns (uint256[] memory) {
        uint256 requestId = requestIds[_id];
        (bool fulfilled, uint256[] memory randomWords) = VRF.getRequestStatus(requestId);
        require(fulfilled, "Random words not yet fulfilled");
        return randomWords;
    }

    function verifyProof(uint256 _id, uint256 _randomNumber, bytes32 _userSecretHash, uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[2] calldata _pubSignals) public {
        require(msg.sender == requesters[_id], "Unauthorized");

        // Get the random words from VRF
        uint256[] memory randomWords = getRandomWords(_id);
        require(randomWords.length > 0, "No random words returned");
        require(randomWords[0] == _randomNumber, "Invalid random number"); // Compare the random number directly

        require(userSecrets[msg.sender] == _userSecretHash, "Invalid user secret");

        require(_pubSignals.length >= 2, "Insufficient public signals");
        require(_pubSignals[0] == _randomNumber, "Public signal for random number mismatch");
        require(_pubSignals[1] == uint256(_userSecretHash), "Public signal for user secret hash mismatch");

        bool proofVerified = verifier.verifyProof(_pA, _pB, _pC, _pubSignals); 
        require(proofVerified, "Invalid proof");

        twoFactorData[_id].success = true;
        twoFactorData[_id].timestamp = block.timestamp;
    }

    // User method to store their 2FA secret
    function setSecret(bytes32 _userSecretHash) external {
        userSecrets[msg.sender] = _userSecretHash;
    }

}