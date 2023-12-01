// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../interfaces/IGroth16VerifierP2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZKPServicesGeneric2FA is Ownable {
    IGroth16VerifierP2 private responseVerifier;
    IGroth16VerifierP2 private passwordChangeVerifier;
    // this contract helps expedite sign up to zkp.services via batched calls
    address public batchSignUpContractAddress;

    struct TwoFactorData {
        bool success;
        uint256 timestamp;
    }

    mapping(uint256 => TwoFactorData) public twoFactorData;
    mapping(uint256 => bytes32) public oneTimeKeyHashes;
    mapping(address => uint256) public userSecrets;
    mapping(uint256 => address) private requesters;

    constructor(
        address _responseVerifierAddress,
        address _passwordChangeVerifierAddress
    ) Ownable(msg.sender) {
        responseVerifier = IGroth16VerifierP2(_responseVerifierAddress);
        passwordChangeVerifier = IGroth16VerifierP2(_passwordChangeVerifierAddress);
    }

    function generate2FA(uint256 _id, bytes32 _oneTimeKeyHash) external {
        require(twoFactorData[_id].timestamp == 0, "2FA ID already used");
        oneTimeKeyHashes[_id] = _oneTimeKeyHash;
        twoFactorData[_id] = TwoFactorData({
            success: false,
            timestamp: block.timestamp
        });
    }

    function requestProof(uint256 _id, string memory _oneTimeKey) external {
        require(
            oneTimeKeyHashes[_id] == keccak256(bytes(_oneTimeKey)),
            "Invalid one-time key"
        );
        require(
            requesters[_id] == address(0),
            "Proof already requested"
        );

        requesters[_id] = msg.sender;
    }

    function verifyProof(
        uint256 _id,
        uint256 _userSecretHash,
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[2] calldata _pubSignals
    ) external {
        require(msg.sender == requesters[_id], "Unauthorized");
        require(userSecrets[msg.sender] != 0, "User secret has not been set");
        require(_pubSignals.length == 2, "Invalid public signals length");

        require(
            userSecrets[msg.sender] == _userSecretHash,
            "Invalid user secret"
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

    function setBatchSignUpContractAddress(address _batchSignUpContractAddress)
        external
        onlyOwner
    {
        require(
            batchSignUpContractAddress == address(0),
            "Batch Sign Up contract address already set"
        );
        batchSignUpContractAddress = _batchSignUpContractAddress;
    }

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

        userSecrets[msg.sender] = _newSecretHash;
    }
}
