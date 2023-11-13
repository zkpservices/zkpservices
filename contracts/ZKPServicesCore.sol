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

contract ZKPServicesCore is ERC20Burnable, Ownable {
    uint256 public requestFee;
    uint256 public responseFee;

    struct RSAKey {
        string key;                         // RSA Public Key
    }

    struct Data {
        string dataHash;                    // SHA256 of associated data
    }

    struct DataRequest {
        string encryptedRequest;            // AES encrypted request
        string encryptedKey;                // AES key encrypted with RSA public key of recipient
        uint256 timeLimit;                  // Time limit in seconds for response
        address _2FAProvider;               // Address of 2FA provider
        address requester;  
        uint256 responseFeeAmount;  
    }

    struct UpdateRequest {
        string encryptedRequest;            // AES encrypted request
        string encryptedKey;                // AES key encrypted with RSA public key of recipient
        uint256 timeLimit;                  // Time limit in seconds for response
        address _2FAProvider;               // Address of 2FA provider
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
    uint256 private constant TOTAL_SUPPLY = 10000000000;
    //99.9999% put into the vault, 0.0001% transferred to deploying wallet
    uint256 private constant VAULT_AMOUNT = (TOTAL_SUPPLY * 999999 ) / 1000000;

    constructor(address _groth16Verifier) ERC20("ZKPServices", "ZKP") {
        responseVerifier = IGroth16VerifierP2(_groth16Verifier);
        _mint(msg.sender, TOTAL_SUPPLY - VAULT_AMOUNT);
        _mint(address(this), VAULT_AMOUNT);
        requestFee = 1 ether;  
    }

    function requestVaultTokens() external {
        _transfer(address(this), msg.sender, 200);
    }

    function setRSAKey(string memory rsaKey) external {
        rsaKeys[msg.sender] = RSAKey(rsaKey);
    }

    function register2FAProvider(address provider) external {
        require(_2FAProviders[provider] == ITwoFactor(address(0)), "Provider already exists");
        _2FAProviders[provider] = ITwoFactor(provider);
        _2FAProviderOwners[provider] = msg.sender;
    }

    function deregister2FAProvider(address provider) external {
        require(msg.sender == _2FAProviderOwners[provider], "Not owner of this 2FA provider");
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
    ) external {
        require(!usedRequestIds[requestId], "This requestId has already been used.");
        require(balanceOf(msg.sender) >= requestFee, "Not enough ZKP tokens for request fee.");
        _burn(msg.sender, requestFee);
        dataRequests[requestId] = DataRequest(encryptedRequest, encryptedKey, 
                                                block.timestamp + timeLimit, _2FAProvider, 
                                                msg.sender, responseFeeAmount);
    }

    function requestUpdate(
        uint256 requestId,
        string memory encryptedRequest,
        string memory encryptedKey,
        uint256 timeLimit,
        address _2FAProvider,
        uint256 responseFeeAmount,
        string memory newHash
    ) external {
        require(!usedRequestIds[requestId], "This requestId has already been used.");
        require(balanceOf(msg.sender) >= requestFee, "Not enough ZKP tokens for request fee.");
        _burn(msg.sender, requestFee);
        updateRequests[requestId] = UpdateRequest(encryptedRequest, encryptedKey, 
                                                    block.timestamp + timeLimit, _2FAProvider, 
                                                    msg.sender, responseFeeAmount, newHash);
    }

    function respond(
        uint256 requestId,
        uint256 twoFactorId,
        uint256 dataLocation,
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[2] calldata _pubSignals,
        bool isUpdate
    ) external {
        require(!usedResponseIds[requestId], "This responseId has already been used.");
        
        uint256 requiredFee = isUpdate ? updateRequests[requestId].responseFeeAmount : 
                                            dataRequests[requestId].responseFeeAmount; 
        require(balanceOf(msg.sender) >= requiredFee, "Not enough ZKP tokens for response fee.");

        uint256 requestTimeLimit = isUpdate ? updateRequests[requestId].timeLimit : 
                                                dataRequests[requestId].timeLimit;
        require(requestTimeLimit >= block.timestamp, "Request has expired.");
 
        address _2FAProvider = isUpdate ? updateRequests[requestId]._2FAProvider : 
                                            dataRequests[requestId]._2FAProvider;
        if (_2FAProvider != address(0)) {
            ITwoFactor.TwoFactorData memory twoFactorData = 
                ITwoFactor(_2FAProvider).twoFactorData(twoFactorId);
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
            obfuscatedData[dataLocation].dataHash = updateRequests[requestId].newHash;
        }

        address requester = isUpdate ? updateRequests[requestId].requester : 
                                        dataRequests[requestId].requester;  
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
    mapping(string => CCIPReceiver) public receivers;
    mapping(string => uint64) public receiverDestinations;

    function setSender(address routerAddress, address linkAddress) 
    external onlyOwner {
        senderRouter = IRouterClient(routerAddress);
        senderToken = LinkTokenInterface(linkAddress);
    }

    function addReceiver(string calldata receiver, address routerReceiverAddress, uint64 destinationChain) 
    external onlyOwner {
        receivers[receiver] = CCIPReceiver(routerReceiverAddress);
        receiverDestinations[receiver] = destinationChain; 
    }

    function sendMessage(
        string memory receiver,
        string calldata text
    ) external onlyOwner returns (bytes32 messageId) {
        require(senderRouter != IRouterClient(address(0)), "Sender not registered");
        require(receivers[receiver] != CCIPReceiver(address(0)), "Receiver not registered");

        uint64 destinationChainSelector = receiverDestinations[receiver]; 
        require(destinationChainSelector != 0, "Destination chain not set for receiver");

        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receivers[receiver]),
            data: abi.encode(text),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000, strict: false})
            ),
            feeToken: address(senderToken)
        });

        uint256 fees = senderRouter.getFee(destinationChainSelector, evm2AnyMessage);
        require(fees <= senderToken.balanceOf(address(this)), "Insufficient LINK balance");

        senderToken.approve(address(senderRouter), fees);
        messageId = senderRouter.ccipSend(destinationChainSelector, evm2AnyMessage);

        return messageId;
    }

    function calculateRequestFees(
        uint64 destinationChainSelector,
        string calldata text
    ) external view returns (uint256) {
        require(senderRouter != IRouterClient(address(0)), "Sender not registered");

        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(address(0)),
            data: abi.encode(text),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000, strict: false})
            ),
            feeToken: address(senderToken)
        });

        return senderRouter.getFee(destinationChainSelector, evm2AnyMessage);
    }

    bytes32 private lastReceivedMessageId;
    string private lastReceivedText;

    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage) internal {
        lastReceivedMessageId = any2EvmMessage.messageId;
        lastReceivedText = abi.decode(any2EvmMessage.data, (string));
    }
}
