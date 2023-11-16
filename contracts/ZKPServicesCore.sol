pragma solidity 0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITwoFactor.sol";
import "./interfaces/IGroth16VerifierP2.sol";

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

    struct RSAKey {
        string key; // RSA Public Key
    }

    struct Data {
        string dataHash; // SHA256 of associated data
    }

    struct DataRequest {
        string encryptedRequest; // AES encrypted request
        string encryptedKey; // AES key encrypted with RSA public key of recipient
        uint256 timeLimit; // Time limit in seconds for response
        address _2FAProvider; // Address of 2FA provider
        address requester;
        uint256 responseFeeAmount;
    }

    struct UpdateRequest {
        string encryptedRequest; // AES encrypted request
        string encryptedKey; // AES key encrypted with RSA public key of recipient
        uint256 timeLimit; // Time limit in seconds for response
        address _2FAProvider; // Address of 2FA provider
        address requester;
        uint256 responseFeeAmount;
        string newHash;
    }

    struct Response {
        uint256 dataLocation;
    }

    /* 
    
    CCIP | Cross-Chain Compatible Variables:
        
        rsaKeys
        obfuscatedData
        responses

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
    IGroth16VerifierP2 public responseVerifier;

    //CCIP compatible variables
    mapping(address => RSAKey) public rsaKeys;
    mapping(uint256 => Data) public obfuscatedData;
    mapping(uint256 => Response) public responses;
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

    constructor(address _coreResponseVerifierAddress, address _CCIPReceiverRouterAddress)
        ERC20("ZKPServices", "ZKP")
        CCIPReceiver(_CCIPReceiverRouterAddress)
    {
        responseVerifier = IGroth16VerifierP2(_coreResponseVerifierAddress);
        _mint(msg.sender, TOTAL_SUPPLY - VAULT_AMOUNT);
        _mint(address(this), VAULT_AMOUNT);
        requestFee = 1 * 10**18;
    }

    function requestVaultTokens() public {
        _transfer(address(this), msg.sender, 200 * 10**18);
    }

    function setRSAKey(string memory rsaKey) public {
        rsaKeys[msg.sender] = RSAKey(rsaKey);
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

    function requestData(
        uint256 requestId,
        string memory encryptedRequest,
        string memory encryptedKey,
        uint256 timeLimit,
        address _2FAProvider,
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
            msg.sender,
            responseFeeAmount
        );
    }

    function requestUpdate(
        uint256 requestId,
        string memory encryptedRequest,
        string memory encryptedKey,
        uint256 timeLimit,
        address _2FAProvider,
        uint256 responseFeeAmount,
        string memory newHash
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
            msg.sender,
            responseFeeAmount,
            newHash
        );
    }

    function respond(
        uint256 requestId,
        uint256 twoFactorId,
        uint256 dataLocation,
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[2] calldata _pubSignals,
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
            ITwoFactor.TwoFactorData memory twoFactorData = ITwoFactor(
                _2FAProvider
            ).twoFactorData(twoFactorId);
            require(twoFactorData.success, "2FA failed.");
        }

        require(
            _pubSignals[0] == requestId &&
                _pubSignals[1] == dataLocation &&
                responseVerifier.verifyProof(_pA, _pB, _pC, _pubSignals),
            "ZKP verification failed."
        );

        require(
            keccak256(bytes(obfuscatedData[dataLocation].dataHash)) ==
                keccak256(bytes(string(abi.encodePacked(_pubSignals[1])))),
            "Mismatched data hash."
        );

        if (isUpdate) {
            obfuscatedData[dataLocation].dataHash = updateRequests[requestId]
                .newHash;
        }

        address requester = isUpdate
            ? updateRequests[requestId].requester
            : dataRequests[requestId].requester;
        _transfer(msg.sender, requester, requiredFee);

        usedResponseIds[requestId] = true;
        responses[requestId] = Response({dataLocation: dataLocation});
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
    mapping(string => uint64) public receivers;
    mapping(uint64 => bool) public originPolicy;

    function setSender(address routerAddress, address linkAddress)
        public
        onlyOwner
    {
        senderRouter = IRouterClient(routerAddress);
        senderToken = LinkTokenInterface(linkAddress);
    }

    function addReceiver(string calldata receiver, uint64 destinationChain)
        public
        onlyOwner
    {
        receivers[receiver] = destinationChain;
    }

    function setOriginPolicy(uint64 origin, bool policy) public onlyOwner {
        originPolicy[origin] = policy;
    }

    function sendMultipleMessages(
        string memory receiver,
        bytes[] memory dataTypes,
        bytes[] memory data
    ) public returns (bytes32 messageId) {
        require(
            senderRouter != IRouterClient(address(0)),
            "Sender not registered"
        );
        require(receivers[receiver] != 0, "Receiver not registered");
        require(
            dataTypes.length == data.length,
            "Mismatch in dataTypes and data arrays length"
        );

        bytes memory combinedData;

        for (uint256 i = 0; i < data.length; i++) {
            bytes memory currentData = abi.encodePacked(dataTypes[i], data[i]);
            combinedData = abi.encodePacked(combinedData, currentData);
        }

        return sendMessage(receiver, combinedData);
    }

    function sendMessage(string memory receiver, bytes memory dataBytes)
        public
        returns (bytes32 messageId)
    {
        require(
            senderRouter != IRouterClient(address(0)),
            "Sender not registered"
        );
        require(receivers[receiver] != 0, "Receiver not registered");

        uint64 destinationChainSelector = receivers[receiver];
        require(
            destinationChainSelector != 0,
            "Destination chain not set for receiver"
        );

        uint8 dataType = uint8(dataBytes[0]);
        bytes memory data = sliceBytes(dataBytes, 1);

        // verification that data being sent from this contract is not spurious
        if (dataType == 0x01) {
            (address key, RSAKey memory rsaKey) = decodeRSAKey(data);
            require(msg.sender == key, "Sender must be the RSA key");
            require(
                keccak256(abi.encode(rsaKeys[key])) ==
                    keccak256(abi.encode(rsaKey)),
                "Mismatch between data key and data"
            );
        } else if (dataType == 0x02) {
            (uint256 key, Data memory dataStruct) = decodeData(data);
            require(
                keccak256(abi.encode(obfuscatedData[key])) ==
                    keccak256(abi.encode(dataStruct)),
                "Mismatch between data and mapping"
            );
        } else if (dataType == 0x03) {
            (uint256 key, DataRequest memory request) = decodeDataRequest(data);
            require(
                keccak256(abi.encode(dataRequests[key])) ==
                    keccak256(abi.encode(request)),
                "Mismatch between data request and mapping"
            );
        } else if (dataType == 0x04) {
            (uint256 key, UpdateRequest memory request) = decodeUpdateRequest(
                data
            );
            require(
                keccak256(abi.encode(updateRequests[key])) ==
                    keccak256(abi.encode(request)),
                "Mismatch between update request and mapping"
            );
        } else if (dataType == 0x05) {
            (uint256 key, Response memory response) = decodeResponse(data);
            require(
                keccak256(abi.encode(responses[key])) ==
                    keccak256(abi.encode(response)),
                "Mismatch between response and mapping"
            );
        } else {
            revert("Invalid dataType");
        }

        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(address(this)),
            data: dataBytes,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000, strict: false})
            ),
            feeToken: address(senderToken)
        });

        uint256 fees = senderRouter.getFee(
            destinationChainSelector,
            evm2AnyMessage
        );
        require(
            fees <= senderToken.balanceOf(msg.sender),
            "Insufficient LINK balance"
        );

        // Transfer the fees from the sender to the contract.
        senderToken.transferFrom(msg.sender, address(this), fees);

        // Approve the router to spend the contract's tokens
        senderToken.approve(address(senderRouter), fees);

        messageId = senderRouter.ccipSend(
            destinationChainSelector,
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
        require(receivers[receiver] != 0, "Receiver not registered");
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

    function estimateMessageFee(string memory receiver, bytes memory dataBytes)
        public
        view
        returns (uint256)
    {
        require(
            senderRouter != IRouterClient(address(0)),
            "Sender not registered"
        );
        require(receivers[receiver] != 0, "Receiver not registered");

        uint64 destinationChainSelector = receivers[receiver];
        require(
            destinationChainSelector != 0,
            "Destination chain not set for receiver"
        );

        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receivers[receiver]),
            data: dataBytes,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000, strict: false})
            ),
            feeToken: address(senderToken)
        });

        return senderRouter.getFee(destinationChainSelector, evm2AnyMessage);
    }

    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage)
        internal
        override
    {
        // strictly trust messages received from trusted chains
        uint64 sourceChain = any2EvmMessage.sourceChainSelector;
        require(originPolicy[sourceChain], "source chain not trusted");
        // strictly trust the the contract with the exact same address as this one (deployed by same wallet with same nonce)
        address sourceChainAddress = abi.decode(
            any2EvmMessage.sender,
            (address)
        );
        require(
            sourceChainAddress == address(this),
            "messages must originate from the same contract address on other chains"
        );

        uint8 dataType = uint8(any2EvmMessage.data[0]);
        bytes memory data = sliceBytes(any2EvmMessage.data, 1);

        if (dataType == 0x01) {
            // RSA key can be overwritten as we check the msg.sender requests the change in sendMessage
            (address key, RSAKey memory rsaKey) = decodeRSAKey(data);
            rsaKeys[key] = rsaKey;
        } else if (dataType == 0x02) {
            (uint256 key, Data memory dataStruct) = decodeData(data);
            require(
                bytes(obfuscatedData[key].dataHash).length == 0,
                "Key already in use"
            );
            obfuscatedData[key] = dataStruct;
        } else if (dataType == 0x03) {
            (uint256 key, DataRequest memory request) = decodeDataRequest(data);
            require(
                bytes(dataRequests[key].encryptedRequest).length == 0,
                "Key already in use"
            );
            dataRequests[key] = request;
        } else if (dataType == 0x04) {
            (uint256 key, UpdateRequest memory request) = decodeUpdateRequest(
                data
            );
            require(
                bytes(updateRequests[key].encryptedRequest).length == 0,
                "Key already in use"
            );
            updateRequests[key] = request;
        } else if (dataType == 0x05) {
            (uint256 key, Response memory response) = decodeResponse(data);
            require(responses[key].dataLocation == 0, "Key already in use");
            responses[key] = response;
        }
    }

    function encodeRSAKey(address key) public view returns (bytes memory) {
        return abi.encode(key, rsaKeys[key]);
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

    function decodeRSAKey(bytes memory encodedData)
        public
        pure
        returns (address, RSAKey memory)
    {
        return abi.decode(encodedData, (address, RSAKey));
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
