pragma solidity 0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITwoFactor.sol";
import "./interfaces/IGroth16VerifierP3.sol";

/*

           /$$                                                             /$$                              
          | $$                                                            |__/                              
 /$$$$$$$$| $$   /$$  /$$$$$$      /$$$$$$$  /$$$$$$   /$$$$$$  /$$    /$$ /$$  /$$$$$$$  /$$$$$$   /$$$$$$$
|____ /$$/| $$  /$$/ /$$__  $$    /$$_____/ /$$__  $$ /$$__  $$|  $$  /$$/| $$ /$$_____/ /$$__  $$ /$$_____/
   /$$$$/ | $$$$$$/ | $$  \ $$   |  $$$$$$ | $$$$$$$$| $$  \__/ \  $$/$$/ | $$| $$      | $$$$$$$$|  $$$$$$ 
  /$$__/  | $$_  $$ | $$  | $$    \____  $$| $$_____/| $$        \  $$$/  | $$| $$      | $$_____/ \____  $$
 /$$$$$$$$| $$ \  $$| $$$$$$$//$$ /$$$$$$$/|  $$$$$$$| $$         \  $/   | $$|  $$$$$$$|  $$$$$$$ /$$$$$$$/
|________/|__/  \__/| $$____/|__/|_______/  \_______/|__/          \_/    |__/ \_______/ \_______/|_______/ 
                    | $$                                                                                    
                    | $$                                                                                    
                    |__/                                                                                    
                                                    
*/

contract ZKPServicesCore is ERC20Burnable, Ownable, CCIPReceiver {
    uint256 public requestFee;
    uint256 public responseFee;

    struct RSAEncryptionKey {
        string key; // RSA Public Encryption Key
    }

    struct RSASigningKey {
        string key; // RSA Signing key for verification
    }

    struct Data {
        string dataHash; // SHA256 of associated data
        uint256 saltHash; // Poseidon hash of obfuscation salt
    }

    struct DataRequest {
        string encryptedRequest; // AES encrypted request
        string encryptedKey; // AES key encrypted with RSA public encryption key of recipient
        uint256 timeLimit; // Time limit in seconds for response
        address _2FAProvider; // (optional) Address of 2FA provider
        uint256 _2FAID; // (optional) 2FA request ID
        address requester;
        uint256 responseFeeAmount;
    }

    struct UpdateRequest {
        string encryptedRequest; // AES encrypted request
        string encryptedKey; // AES key encrypted with RSA public encryption key of recipient
        uint256 timeLimit; // Time limit in seconds for response
        address _2FAProvider; // (optional) Address of 2FA provider
        uint256 _2FAID; // (optional) 2FA request ID
        address requester;
        uint256 responseFeeAmount;
        string dataHash;
        uint256 saltHash;
    }

    struct Response {
        string dataHash;
    }

    // this is an optional field which is used to house information about a
    // wallet, for example, a verifier pharmacy's location, store name, license
    // number, etc. all of the information housed here is also verifiable with
    // a DataRequest if it is onboarded, but it is provided here for convenience and
    // to house alternative data not on the protocol potentially - for example, a
    // wallet/vendor license combination could potentially be more easily verified in
    // an alternative manner such as a trusted government website lookup
    struct PublicUserInformation {
        string information;
    }

    /* 

    CCIP | Cross-Chain Compatible Variables:
        
        rsaEncryptionKeys
        rsaSigningKeys
        obfuscatedData
        responses
        publicUserInformation

    Partially Compatible Variables:
        
        dataRequests
        updateRequests

           *due to the fact that selected 2FA providers would 
            need to be able to support equivalent logic and 
            addresses on the destination chain (this is 
            available with ZKPServicesVRF2FA but may not
            be for others)
           *to clarify - this is supported via CCIP but not
            guaranteed to work on other chains as it is 2FA-
            provider dependent

    Incompatible Variables:
        
        _2FAProviders
        _2FAProviderOwners

           *these are either redundant or incompatible to 
            sync across chains as the 2FA providers in 
            question would need to be able to support
            equivalent logic and addresses across chains,
            which may not be guaranteed
    */

    //ZKP Solidity verifier
    IGroth16VerifierP3 public responseVerifier;

    //CCIP compatible variables
    mapping(address => RSAEncryptionKey) public rsaEncryptionKeys;
    mapping(address => RSASigningKey) public rsaSigningKeys;
    mapping(uint256 => Data) public obfuscatedData;
    mapping(uint256 => Response) public responses;
    mapping(address => PublicUserInformation) public publicUserInformation;
    //CCIP partially compatible variables
    mapping(uint256 => DataRequest) public dataRequests;
    mapping(uint256 => UpdateRequest) public updateRequests;

    mapping(uint256 => bool) public usedRequestIds;
    mapping(uint256 => bool) public usedResponseIds;      
    mapping(address => ITwoFactor) public _2FAProviders;
    mapping(address => address) public _2FAProviderOwners;

    //note: proper tokenomics not implemented, only token utility demonstrated
    uint256 private constant TOTAL_SUPPLY = 10000000000 * 10**18;
    //99.9999% put into the vault, 0.0001% transferred to deploying wallet
    uint256 private constant VAULT_AMOUNT = (TOTAL_SUPPLY * 999999) / 1000000;

    constructor(
        address _coreResponseVerifierAddress,
        address _CCIPReceiverRouterAddress
    ) ERC20("ZKPServices", "ZKP") CCIPReceiver(_CCIPReceiverRouterAddress) {
        responseVerifier = IGroth16VerifierP3(_coreResponseVerifierAddress);
        _mint(msg.sender, TOTAL_SUPPLY - VAULT_AMOUNT);
        _mint(address(this), VAULT_AMOUNT);
        requestFee = 1 * 10**18;
    }

    function requestVaultTokens() public {
        _transfer(address(this), msg.sender, 200 * 10**18);
    }

    function setRequestFee(uint256 _requestFee) public onlyOwner { 
        requestFee = _requestFee;
    }

    function setRSAEncryptionKey(string memory rsaEncryptionKey) public {
        rsaEncryptionKeys[msg.sender] = RSAEncryptionKey(rsaEncryptionKey);
    }

    function setRSASigningKey(string memory rsaSigningKey) public {
        rsaSigningKeys[msg.sender] = RSASigningKey(rsaSigningKey);
    }

    function setPublicUserInformation(string memory _publicUserInformation)
        public
    {
        publicUserInformation[msg.sender] = PublicUserInformation(
            _publicUserInformation
        );
    }

    function register2FAProvider(address provider) public {
        require(
            _2FAProviders[provider] == ITwoFactor(address(0)),
            "Provider already exists"
        );
        _2FAProviders[provider] = ITwoFactor(provider);
        _2FAProviderOwners[provider] = msg.sender;
    }

    function deregister2FAProvider(address provider) public {
        require(
            msg.sender == _2FAProviderOwners[provider],
            "Not owner of this 2FA provider"
        );
        delete _2FAProviders[provider];
        delete _2FAProviderOwners[provider];
    }

    // request ID = poseidon(field + key)
    function requestData(
        uint256 requestId,
        string memory encryptedRequest,
        string memory encryptedKey,
        uint256 timeLimit,
        address _2FAProvider,
        uint256 _2FAID,
        uint256 responseFeeAmount
    ) public {
        require(
            !usedRequestIds[requestId],
            "This requestId has already been used."
        );
        require(
            balanceOf(msg.sender) >= requestFee,
            "Not enough ZKP tokens for request fee."
        );
        _burn(msg.sender, requestFee);
        dataRequests[requestId] = DataRequest(
            encryptedRequest,
            encryptedKey,
            block.timestamp + timeLimit,
            _2FAProvider,
            _2FAID,
            msg.sender,
            responseFeeAmount
        );

        usedRequestIds[requestId] = true;
    }

    // request ID = poseidon(field + key)
    // storage location = poseidon(field + salt + user secret)
    // salt hash = poseidon(salt)
    // *salt hash is required for obfuscation in smart contract storage location
    // *in case the user secret gets leaked, salt further obfuscates
    //  which data hashes corresponds to plaintext fields in the smart
    //  contract
    function requestUpdate(
        uint256 requestId,
        string memory encryptedRequest,
        string memory encryptedKey,
        uint256 timeLimit,
        address _2FAProvider,
        uint256 _2FAID,
        uint256 responseFeeAmount,
        string memory dataHash,
        uint256 saltHash
    ) public {
        require(
            !usedRequestIds[requestId],
            "This requestId has already been used."
        );
        require(
            balanceOf(msg.sender) >= requestFee,
            "Not enough ZKP tokens for request fee."
        );
        _burn(msg.sender, requestFee);
        updateRequests[requestId] = UpdateRequest(
            encryptedRequest,
            encryptedKey,
            block.timestamp + timeLimit,
            _2FAProvider,
            _2FAID,
            msg.sender,
            responseFeeAmount,
            dataHash,
            saltHash
        );

        usedRequestIds[requestId] = true;
    }

    // request ID = poseidon(field + key)
    // storage location = poseidon(field + salt + user secret)
    // salt hash = poseidon(salt)
    function respond(
        uint256 requestId,
        uint256 dataLocation,
        uint256 saltHash,
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[3] calldata _pubSignals,
        bool isUpdate
    ) public {
        require(
            !usedResponseIds[requestId],
            "This responseId has already been used."
        );

        uint256 requiredFee = isUpdate
            ? updateRequests[requestId].responseFeeAmount
            : dataRequests[requestId].responseFeeAmount;
        require(
            balanceOf(msg.sender) >= requiredFee,
            "Not enough ZKP tokens for response fee."
        );

        uint256 requestTimeLimit = isUpdate
            ? updateRequests[requestId].timeLimit
            : dataRequests[requestId].timeLimit;
        require(requestTimeLimit >= block.timestamp, "Request has expired.");

        address _2FAProvider = isUpdate
            ? updateRequests[requestId]._2FAProvider
            : dataRequests[requestId]._2FAProvider;
        if (_2FAProvider != address(0)) {
            uint256 _2FAID = isUpdate
                ? updateRequests[requestId]._2FAID
                : dataRequests[requestId]._2FAID;
            ITwoFactor.TwoFactorData memory twoFactorData = ITwoFactor(
                _2FAProvider
            ).twoFactorData(_2FAID);
            require(twoFactorData.success, "2FA failed.");
        }

        require(
            _pubSignals[0] == requestId &&
                _pubSignals[1] == dataLocation &&
                _pubSignals[2] == saltHash &&
                responseVerifier.verifyProof(_pA, _pB, _pC, _pubSignals),
            "ZKP verification failed."
        );

        if (isUpdate) {
            require(
                saltHash == updateRequests[requestId].saltHash,
                "Salt hash does not match update request salt hash"
            );
            obfuscatedData[dataLocation].dataHash = updateRequests[requestId]
                .dataHash;
            obfuscatedData[dataLocation].saltHash = updateRequests[requestId]
                .saltHash;
        } else {
            require(
                saltHash == obfuscatedData[dataLocation].saltHash,
                "Salt hash does not match stored salt hash"
            );
        }

        address requester = isUpdate
            ? updateRequests[requestId].requester
            : dataRequests[requestId].requester;
        _transfer(msg.sender, requester, requiredFee);

        responses[requestId] = Response({
            dataHash: obfuscatedData[dataLocation].dataHash
        });

        usedResponseIds[requestId] = true;
    }

    /*

      /$$$$$$   /$$$$$$  /$$$$$$ /$$$$$$$ 
     /$$__  $$ /$$__  $$|_  $$_/| $$__  $$
    | $$  \__/| $$  \__/  | $$  | $$  \ $$
    | $$      | $$        | $$  | $$$$$$$/
    | $$      | $$        | $$  | $$____/ 
    | $$    $$| $$    $$  | $$  | $$      
    |  $$$$$$/|  $$$$$$/ /$$$$$$| $$      
     \______/  \______/ |______/|__/      
                                        
*/

    IRouterClient public senderRouter;
    LinkTokenInterface public senderToken;
    mapping(string => uint64) public receiverChainId;
    mapping(string => uint256) public receiverCCIPFees;
    mapping(string => address) public receiverAddress;
    mapping(bytes32 => bool) public originPolicy;

    function setSender(address routerAddress, address linkAddress)
        public
        onlyOwner
    {
        senderRouter = IRouterClient(routerAddress);
        senderToken = LinkTokenInterface(linkAddress);
    }

    /**
     * @dev Allows the contract owner to set a static fee for a specified receiver in terms of the zkp.services ERC20 token.
     * Currently, using the native ERC20 provides an easy approach for users. However, the underlying architecture
     * has the capability to facilitate payments using other tokens, such as LINK or native tokens (e.g. AVAX), in subsequent versions.
     * Choosing these alternatives at this stage would require two transactions: one to grant spending approvals for LINK/AVAX,
     * and another for executing the desired operation. Future models can incorporate Chainlink/Uniswap oracles for dynamic pricing,
     * and support the LINK/native asset payment options as well. The estimation functions to calculate the fees in terms of LINK
     * can be leveraged to create a per-user LINK vault, etc.
     */
    function setReceiver(
        string calldata receiver,
        uint64 destinationChain,
        uint256 CCIPFee,
        address _receiverAddress
    ) public onlyOwner {
        receiverChainId[receiver] = destinationChain;
        receiverCCIPFees[receiver] = CCIPFee;
        receiverAddress[receiver] = _receiverAddress;
    }

    function setOriginPolicy(
        uint64 _originChain,
        address _originAddress,
        bool policy
    ) public onlyOwner {
        originPolicy[
            keccak256(abi.encodePacked(_originChain, _originAddress))
        ] = policy;
    }

    function sendMultipleMessages(
        string memory receiver,
        bytes[] memory dataTypes,
        bytes[] memory data
    ) public returns (bytes32[] memory messageIds) {
        require(
            dataTypes.length == data.length,
            "Mismatch in dataTypes and data arrays length"
        );

        messageIds = new bytes32[](data.length);

        for (uint256 i = 0; i < data.length; i++) {
            bytes memory currentData = abi.encodePacked(dataTypes[i], data[i]);
            messageIds[i] = sendMessage(receiver, currentData);
        }

        return messageIds;
    }

    function sendMessage(string memory receiver, bytes memory dataBytes)
        public
        returns (bytes32 messageId)
    {
        require(
            senderRouter != IRouterClient(address(0)),
            "Sender not registered"
        );
        require(receiverChainId[receiver] != 0, "Receiver not registered");

        uint8 dataType = uint8(dataBytes[0]);
        bytes memory data = sliceBytes(dataBytes, 1);

        // verification that data being sent from this contract is not spurious
        if (dataType == 0x01) {
            (
                address key,
                RSAEncryptionKey memory rsaEncryptionKey
            ) = decodeRSAEncryptionKey(data);
            require(msg.sender == key, "Sender must be the RSA key owner");
            require(
                keccak256(abi.encode(rsaEncryptionKeys[key])) ==
                    keccak256(abi.encode(rsaEncryptionKey)),
                "Mismatch between data at stored key and data provided"
            );
        } else if (dataType == 0x02) {
            (
                address key,
                RSASigningKey memory rsaSigningKey
            ) = decodeRSASigningKey(data);
            require(msg.sender == key, "Sender must be the RSA key owner");
            require(
                keccak256(abi.encode(rsaSigningKeys[key])) ==
                    keccak256(abi.encode(rsaSigningKey)),
                "Mismatch between data at stored key and data provided"
            );
        } else if (dataType == 0x03) {
            (uint256 key, Data memory dataStruct) = decodeData(data);
            require(
                keccak256(abi.encode(obfuscatedData[key])) ==
                    keccak256(abi.encode(dataStruct)),
                "Mismatch between data at stored key and data provided"
            );
        } else if (dataType == 0x04) {
            (uint256 key, DataRequest memory request) = decodeDataRequest(data);
            require(
                keccak256(abi.encode(dataRequests[key])) ==
                    keccak256(abi.encode(request)),
                "Mismatch between data at stored key and data provided"
            );
        } else if (dataType == 0x05) {
            (uint256 key, UpdateRequest memory request) = decodeUpdateRequest(
                data
            );
            require(
                keccak256(abi.encode(updateRequests[key])) ==
                    keccak256(abi.encode(request)),
                "Mismatch between data at stored key and data provided"
            );
        } else if (dataType == 0x06) {
            (uint256 key, Response memory response) = decodeResponse(data);
            require(
                keccak256(abi.encode(responses[key])) ==
                    keccak256(abi.encode(response)),
                "Mismatch between data at stored key and data provided"
            );
        } else if (dataType == 0x07) {
            (
                address key,
                PublicUserInformation memory _publicUserInformation
            ) = decodePublicUserInformation(data);
            require(
                msg.sender == key,
                "Sender must be the public user information owner"
            );
            require(
                keccak256(abi.encode(publicUserInformation[key])) ==
                    keccak256(abi.encode(_publicUserInformation)),
                "Mismatch between data at stored key and data provided"
            );
        } else {
            revert("Invalid dataType");
        }

        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiverAddress[receiver]),
            data: dataBytes,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 2000000, strict: false})
            ),
            feeToken: address(senderToken)
        });

        uint256 linkFees = senderRouter.getFee(
            receiverChainId[receiver],
            evm2AnyMessage
        );
        require(
            linkFees <= senderToken.balanceOf(address(this)),
            "Insufficient LINK balance"
        );

        // Approve the router to spend the contract's tokens
        senderToken.approve(address(senderRouter), linkFees);

        require(
            balanceOf(msg.sender) >= receiverCCIPFees[receiver],
            "Insufficient ZKP balance"
        );

        if (receiverCCIPFees[receiver] > 0 && owner() != msg.sender) {
            _transfer(msg.sender, owner(), receiverCCIPFees[receiver]);
        }

        messageId = senderRouter.ccipSend(
            receiverChainId[receiver],
            evm2AnyMessage
        );

        return messageId;
    }

    function estimateMultipleMessagesFees(
        string memory receiver,
        bytes[] memory dataTypes,
        bytes[] memory data
    ) public view returns (uint256 totalFees) {
        require(
            senderRouter != IRouterClient(address(0)),
            "Sender not registered"
        );
        require(receiverChainId[receiver] != 0, "Receiver not registered");
        require(
            dataTypes.length == data.length,
            "Mismatch in dataTypes and data arrays length"
        );

        totalFees = 0;

        for (uint256 i = 0; i < data.length; i++) {
            bytes memory currentData = abi.encodePacked(dataTypes[i], data[i]);
            totalFees = totalFees + estimateMessageFee(receiver, currentData);
        }

        return totalFees;
    }

    // first byte should be the data type
    function estimateMessageFee(string memory receiver, bytes memory dataBytes)
        public
        view
        returns (uint256)
    {
        require(
            senderRouter != IRouterClient(address(0)),
            "Sender not registered"
        );
        require(receiverChainId[receiver] != 0, "Receiver not registered");

        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiverAddress[receiver]),
            data: dataBytes,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000, strict: false})
            ),
            feeToken: address(senderToken)
        });

        return senderRouter.getFee(receiverChainId[receiver], evm2AnyMessage);
    }

    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage)
        internal
        override
    {
        // strictly trust messages received from trusted chains and addresses
        uint64 sourceChain = any2EvmMessage.sourceChainSelector;
        address sourceChainAddress = abi.decode(
            any2EvmMessage.sender,
            (address)
        );
        require(
            originPolicy[
                keccak256(abi.encodePacked(sourceChain, sourceChainAddress))
            ],
            "Messages must originate from a trusted chain and contract address"
        );

        uint8 dataType = uint8(any2EvmMessage.data[0]);
        bytes memory data = sliceBytes(any2EvmMessage.data, 1);

        if (dataType == 0x01) {
            // RSA key can be overwritten as we check the msg.sender requests the change in sendMessage
            (
                address key,
                RSAEncryptionKey memory rsaEncryptionKey
            ) = decodeRSAEncryptionKey(data);
            rsaEncryptionKeys[key] = rsaEncryptionKey;
        } else if (dataType == 0x02) {
            // RSA key can be overwritten as we check the msg.sender requests the change in sendMessage
            (
                address key,
                RSASigningKey memory rsaSigningKey
            ) = decodeRSASigningKey(data);
            rsaSigningKeys[key] = rsaSigningKey;
        } else if (dataType == 0x03) {
            (uint256 key, Data memory dataStruct) = decodeData(data);
            require(
                bytes(obfuscatedData[key].dataHash).length == 0,
                "Key already in use"
            );
            obfuscatedData[key] = dataStruct;
        } else if (dataType == 0x04) {
            (uint256 key, DataRequest memory request) = decodeDataRequest(data);
            require(
                !usedRequestIds[key],
                "This requestId has already been used."
            );
            dataRequests[key] = request;
            usedRequestIds[key] = true;
        } else if (dataType == 0x05) {
            (uint256 key, UpdateRequest memory request) = decodeUpdateRequest(
                data
            );
            require(
                !usedRequestIds[key],
                "This requestId has already been used."
            );
            updateRequests[key] = request;
            usedRequestIds[key] = true;
        } else if (dataType == 0x06) {
            (uint256 key, Response memory response) = decodeResponse(data);
            require(
                !usedResponseIds[key],
                "This responseId has already been used."
            );
            responses[key] = response;
            usedResponseIds[key] = true;
        } else if (dataType == 0x07) {
            (
                address key,
                PublicUserInformation memory _publicUserInformation
            ) = decodePublicUserInformation(data);
            publicUserInformation[key] = _publicUserInformation;
        }
    }

    function encodeRSAEncryptionKey(address key)
        public
        view
        returns (bytes memory)
    {
        return abi.encode(key, rsaEncryptionKeys[key]);
    }

    function encodeRSASigningKey(address key)
        public
        view
        returns (bytes memory)
    {
        return abi.encode(key, rsaSigningKeys[key]);
    }

    function encodeData(uint256 key) public view returns (bytes memory) {
        return abi.encode(key, obfuscatedData[key]);
    }

    function encodeDataRequest(uint256 key) public view returns (bytes memory) {
        return abi.encode(key, dataRequests[key]);
    }

    function encodeUpdateRequest(uint256 key)
        public
        view
        returns (bytes memory)
    {
        return abi.encode(key, updateRequests[key]);
    }

    function encodeResponse(uint256 key) public view returns (bytes memory) {
        return abi.encode(key, responses[key]);
    }

    function encodePublicUserInformation(address key)
        public
        view
        returns (bytes memory)
    {
        return abi.encode(key, publicUserInformation[key]);
    }

    function decodeRSAEncryptionKey(bytes memory encodedData)
        public
        pure
        returns (address, RSAEncryptionKey memory)
    {
        return abi.decode(encodedData, (address, RSAEncryptionKey));
    }

    function decodeRSASigningKey(bytes memory encodedData)
        public
        pure
        returns (address, RSASigningKey memory)
    {
        return abi.decode(encodedData, (address, RSASigningKey));
    }

    function decodeData(bytes memory encodedData)
        public
        pure
        returns (uint256, Data memory)
    {
        return abi.decode(encodedData, (uint256, Data));
    }

    function decodeDataRequest(bytes memory encodedData)
        public
        pure
        returns (uint256, DataRequest memory)
    {
        return abi.decode(encodedData, (uint256, DataRequest));
    }

    function decodeUpdateRequest(bytes memory encodedData)
        public
        pure
        returns (uint256, UpdateRequest memory)
    {
        return abi.decode(encodedData, (uint256, UpdateRequest));
    }

    function decodeResponse(bytes memory encodedData)
        public
        pure
        returns (uint256, Response memory)
    {
        return abi.decode(encodedData, (uint256, Response));
    }

    function decodePublicUserInformation(bytes memory encodedData)
        public
        pure
        returns (address, PublicUserInformation memory)
    {
        return abi.decode(encodedData, (address, PublicUserInformation));
    }

    function sliceBytes(bytes memory _bytes, uint256 start)
        internal
        pure
        returns (bytes memory)
    {
        uint256 length = _bytes.length - start;
        bytes memory slicedBytes = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            slicedBytes[i] = _bytes[i + start];
        }
        return slicedBytes;
    }
}
