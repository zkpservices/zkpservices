pragma solidity ^0.8.20;

// Interface for 2FAContract
interface _2FAInterface {
    function setSecret(uint256 _userSecretHash) external;
}

// Interface for CoreContract
interface CoreContractInterface {
    function setRSAEncryptionKey(string memory rsaEncryptionKey) external;
    function setRSASigningKey(string memory rsaSigningKey) external;
    function setPublicUserInformation(string memory _publicUserInformation) external;
}

contract BatchSignUp is _2FAInterface, CoreContractInterface {
    _2FAInterface public _2FAContract;
    CoreContractInterface public coreContract;

    constructor(address _2FAContractAddress, address coreContractAddress) {
        _2FAContract = _2FAInterface(_2FAContractAddress);
        coreContract = CoreContractInterface(coreContractAddress);
    }

    function setSecret(uint256 _userSecretHash) external override {
        _2FAContract.setSecret(_userSecretHash);
    }

    function setRSAEncryptionKey(string memory rsaEncryptionKey) external override {
        coreContract.setRSAEncryptionKey(rsaEncryptionKey);
    }

    function setRSASigningKey(string memory rsaSigningKey) external override {
        coreContract.setRSASigningKey(rsaSigningKey);
    }

    function setPublicUserInformation(string memory _publicUserInformation) external override {
        coreContract.setPublicUserInformation(_publicUserInformation);
    }

    function batchSignUp(
        uint256 _userSecretHash,
        string memory rsaEncryptionKey,
        string memory rsaSigningKey,
        string memory publicUserInformation
    ) external {
        _2FAContract.setSecret(_userSecretHash);
        coreContract.setRSAEncryptionKey(rsaEncryptionKey);
        coreContract.setRSASigningKey(rsaSigningKey);
        coreContract.setPublicUserInformation(publicUserInformation);
    }
}
