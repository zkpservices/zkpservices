pragma solidity ^0.8.20;

// Interface for 2FAContract
interface _2FAInterface {
    function setSecret(uint256 _userSecretHash) external;
}

// Interface for CoreContract
interface CoreContractInterface {
    function setRSAEncryptionKey(string memory rsaEncryptionKey) external;

    function setRSASigningKey(string memory rsaSigningKey) external;

    function setPublicUserInformation(string memory _publicUserInformation)
        external;
}

contract BatchSignUp is _2FAInterface, CoreContractInterface {
    _2FAInterface public _2FAContract;
    CoreContractInterface public coreContract;

    constructor(address _2FAContractAddress, address coreContractAddress) {
        _2FAContract = _2FAInterface(_2FAContractAddress);
        coreContract = CoreContractInterface(coreContractAddress);
    }

    function setSecret(uint256 _userSecretHash) external override {
        // Use delegatecall to relay msg.sender to _2FAContract
        (bool success, ) = address(_2FAContract).delegatecall(
            abi.encodeWithSignature("setSecret(uint256)", _userSecretHash)
        );
        require(success, "SetSecret delegatecall failed");
    }

    function setRSAEncryptionKey(string memory rsaEncryptionKey)
        external
        override
    {
        // Use delegatecall to relay msg.sender to coreContract
        (bool success, ) = address(coreContract).delegatecall(
            abi.encodeWithSignature(
                "setRSAEncryptionKey(string)",
                rsaEncryptionKey
            )
        );
        require(success, "SetRSAEncryptionKey delegatecall failed");
    }

    function setRSASigningKey(string memory rsaSigningKey) external override {
        // Use delegatecall to relay msg.sender to coreContract
        (bool success, ) = address(coreContract).delegatecall(
            abi.encodeWithSignature("setRSASigningKey(string)", rsaSigningKey)
        );
        require(success, "SetRSASigningKey delegatecall failed");
    }

    function setPublicUserInformation(string memory _publicUserInformation)
        external
        override
    {
        // Use delegatecall to relay msg.sender to coreContract
        (bool success, ) = address(coreContract).delegatecall(
            abi.encodeWithSignature(
                "setPublicUserInformation(string)",
                _publicUserInformation
            )
        );
        require(success, "SetPublicUserInformation delegatecall failed");
    }

    function batchSignUp(
        uint256 _userSecretHash,
        string memory rsaEncryptionKey,
        string memory rsaSigningKey,
        string memory publicUserInformation
    ) external {
        // Use delegatecall to relay msg.sender to _2FAContract
        (bool success, ) = address(_2FAContract).delegatecall(
            abi.encodeWithSignature("setSecret(uint256)", _userSecretHash)
        );
        require(success, "SetSecret delegatecall failed");

        // Use delegatecall to relay msg.sender to coreContract
        (success, ) = address(coreContract).delegatecall(
            abi.encodeWithSignature(
                "setRSAEncryptionKey(string)",
                rsaEncryptionKey
            )
        );
        require(success, "SetRSAEncryptionKey delegatecall failed");

        // Use delegatecall to relay msg.sender to coreContract
        (success, ) = address(coreContract).delegatecall(
            abi.encodeWithSignature("setRSASigningKey(string)", rsaSigningKey)
        );
        require(success, "SetRSASigningKey delegatecall failed");

        // Use delegatecall to relay msg.sender to coreContract
        (success, ) = address(coreContract).delegatecall(
            abi.encodeWithSignature(
                "setPublicUserInformation(string)",
                publicUserInformation
            )
        );
        require(success, "SetPublicUserInformation delegatecall failed");
    }
}
