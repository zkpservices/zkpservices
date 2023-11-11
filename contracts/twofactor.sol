// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./vrf.sol";

contract twofactor {

    vrf private VRF;

    struct TwoFactorData {
        bool success;
        uint256 timestamp;
        bool expired;
    }

    mapping(uint256 => TwoFactorData) public twoFactorData; // 2FA ID => (boolean indicating success, timestamp, expired)
    mapping(uint256 => bytes32) public oneTimeKeyHashes; // 2FA ID => hash of one time key for 2FA request
    mapping(address => bytes32) public userSecrets; // address => hash of 2FA secret/password
    mapping(uint256 => uint256) public randomNumbers; // 2FA ID => random number
    mapping(uint256 => address) private requesters; // 2FA ID => address of the requester

    constructor(address _vrfAddress) {
        VRF = vrf(_vrfAddress);
    }

    function generate2FA(uint256 _id, bytes32 _oneTimeKeyHash) external {
        require(twoFactorData[_id].timestamp == 0, "2FA ID already used");
        oneTimeKeyHashes[_id] = _oneTimeKeyHash;
        twoFactorData[_id] = TwoFactorData({ success: false, timestamp: block.timestamp, expired: false });
    }

    function requestRandomNumber(uint256 _id, bytes32 _oneTimeKeyHash) external {
        require(!twoFactorData[_id].expired, "2FA ID expired");
        require(oneTimeKeyHashes[_id] == _oneTimeKeyHash, "Invalid one time key");
        require(requesters[_id] == address(0) || requesters[_id] == msg.sender, "Random number already requested");

        uint256 randomNumber = VRF.requestRandomWords();
        randomNumbers[_id] = randomNumber;
        requesters[_id] = msg.sender;
    }

    function verifyProof(uint256 _id, bytes calldata _oneTimeKey, uint256 _randomNumber, bytes32 _userSecretHash, uint256[] memory proof, uint256[] memory publicSignals) public {
        require(msg.sender == requesters[_id], "Unauthorized");
        require(!twoFactorData[_id].expired, "2FA ID expired");
        require(randomNumbers[_id] == _randomNumber, "Invalid random number");
        require(userSecrets[msg.sender] == _userSecretHash, "Invalid user secret");
        require(oneTimeKeyHashes[_id] == keccak256(_oneTimeKey), "Invalid one time key");

        require(publicSignals.length >= 2, "Insufficient public signals");
        require(publicSignals[0] == _randomNumber, "Public signal for random number mismatch");
        require(publicSignals[1] == uint256(_userSecretHash), "Public signal for user secret hash mismatch");

        bool proofVerified = Verifier.verifyProof(proof, publicSignals);
        require(proofVerified, "Invalid proof");

        twoFactorData[_id].success = true;
        twoFactorData[_id].timestamp = block.timestamp; // Updating the timestamp
        twoFactorData[_id].expired = true; // We expire the ID after successful verification
    }

    // User method to store their 2FA secret
    function setSecret(bytes32 _userSecretHash) external {
        userSecrets[msg.sender] = _userSecretHash;
    }

}
