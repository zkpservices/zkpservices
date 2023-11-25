pragma solidity ^0.8.20;

// Interface for 2FAContract
interface _2FAInterface {
    function setSecretBatchSignUpContractAddress(
        uint256 _userSecretHash,
        address userAddress
    ) external;
}

// Interface for CoreContract
interface CoreContractInterface {
    function setRSAEncryptionKeyBatchSignUpContractAddress(
        string memory rsaEncryptionKey,
        address userAddress
    ) external;

    function setRSASigningKeyBatchSignUpContractAddress(
        string memory rsaSigningKey,
        address userAddress
    ) external;

    function setPublicUserInformationBatchSignUpContractAddress(
        string memory _publicUserInformation,
        address userAddress
    ) external;
}

contract BatchSignUp is _2FAInterface, CoreContractInterface {
    _2FAInterface public _2FAContract;
    CoreContractInterface public coreContract;

    constructor(address _2FAContractAddress, address coreContractAddress) {
        _2FAContract = _2FAInterface(_2FAContractAddress);
        coreContract = CoreContractInterface(coreContractAddress);
    }

    function setSecretBatchSignUpContractAddress(
        uint256 _userSecretHash,
        address userAddress
    ) external override {
        _2FAContract.setSecretBatchSignUpContractAddress(
            _userSecretHash,
            userAddress
        );
    }

    function setRSAEncryptionKeyBatchSignUpContractAddress(
        string memory rsaEncryptionKey,
        address userAddress
    ) external override {
        coreContract.setRSAEncryptionKeyBatchSignUpContractAddress(
            rsaEncryptionKey,
            userAddress
        );
    }

    function setRSASigningKeyBatchSignUpContractAddress(
        string memory rsaSigningKey,
        address userAddress
    ) external override {
        coreContract.setRSASigningKeyBatchSignUpContractAddress(
            rsaSigningKey,
            userAddress
        );
    }

    function setPublicUserInformationBatchSignUpContractAddress(
        string memory _publicUserInformation,
        address userAddress
    ) external override {
        coreContract.setPublicUserInformationBatchSignUpContractAddress(
            _publicUserInformation,
            userAddress
        );
    }

    function batchSignUp(
        uint256 _userSecretHash,
        string memory rsaEncryptionKey,
        string memory rsaSigningKey,
        string memory publicUserInformation
    ) external {
        _2FAContract.setSecretBatchSignUpContractAddress(
            _userSecretHash,
            msg.sender
        );
        coreContract.setRSAEncryptionKeyBatchSignUpContractAddress(
            rsaEncryptionKey,
            msg.sender
        );
        coreContract.setRSASigningKeyBatchSignUpContractAddress(
            rsaSigningKey,
            msg.sender
        );
        coreContract.setPublicUserInformationBatchSignUpContractAddress(
            publicUserInformation,
            msg.sender
        );
    }
}
