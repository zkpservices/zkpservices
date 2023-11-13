pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITwoFactor.sol";
import "./interfaces/IGroth16VerifierP2.sol";

contract ZKPServicesCore is ERC20Burnable, Ownable {
    uint256 public requestFee;
    uint256 public responseFee;

    struct RSAKey {
        string key;                         // RSA Public Key
    }

    struct Signature {
        RSAKey publicKey;                   // RSA Public Key
        string signedHash;                  // SHA256 signed with RSA private key of updating party
    }

    struct Data {
        string dataHash;                    // SHA256 of associated data
        Signature signature;                
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
        Signature signature;
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

            due to the fact that selected 2FA providers would 
            need to be able to support equivalent logic and 
            addresses on the destination chain (this is 
            available with ZKPServicesVRF2FA but may not
            be for others)

    Incompatible Variables:
        _2FAProviders
        _2FAProviderOwners

            these are either redundant or incompatible to 
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
        dataRequests[requestId] = DataRequest(encryptedRequest, encryptedKey, block.timestamp + timeLimit, _2FAProvider, msg.sender, responseFeeAmount);
    }

    function requestUpdate(
        uint256 requestId,
        string memory encryptedRequest,
        string memory encryptedKey,
        uint256 timeLimit,
        address _2FAProvider,
        uint256 responseFeeAmount,
        string memory newHash,
        Signature memory signature
    ) external {
        require(!usedRequestIds[requestId], "This requestId has already been used.");
        require(balanceOf(msg.sender) >= requestFee, "Not enough ZKP tokens for request fee.");
        _burn(msg.sender, requestFee);
        updateRequests[requestId] = UpdateRequest(encryptedRequest, encryptedKey, block.timestamp + timeLimit, _2FAProvider, msg.sender, responseFeeAmount, newHash, signature);
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
        
        uint256 requiredFee = isUpdate ? updateRequests[requestId].responseFeeAmount : dataRequests[requestId].responseFeeAmount; 
        require(balanceOf(msg.sender) >= requiredFee, "Not enough ZKP tokens for response fee.");

        uint256 requestTimeLimit = isUpdate ? updateRequests[requestId].timeLimit : dataRequests[requestId].timeLimit;
        require(requestTimeLimit >= block.timestamp, "Request has expired.");
 
        address _2FAProvider = isUpdate ? updateRequests[requestId]._2FAProvider : dataRequests[requestId]._2FAProvider;
        if (_2FAProvider != address(0)) {
            ITwoFactor.TwoFactorData memory twoFactorData = ITwoFactor(_2FAProvider).twoFactorData(twoFactorId);
            require(twoFactorData.success, "2FA failed.");
        }

        require(
            _pubSignals[0] == requestId &&
            _pubSignals[1] == dataLocation &&
            responseVerifier.verifyProof(_pA, _pB, _pC, _pubSignals),
            "ZKP verification failed."
        );

        require(
            keccak256(bytes(obfuscatedData[dataLocation].dataHash)) == keccak256(bytes(string(abi.encodePacked(_pubSignals[1])))),
            "Mismatched data hash."
        );

        if (isUpdate) {
            obfuscatedData[dataLocation].dataHash = updateRequests[requestId].newHash;
            obfuscatedData[dataLocation].signature = updateRequests[requestId].signature;
        }

        address requester = isUpdate ? updateRequests[requestId].requester : dataRequests[requestId].requester;  
        _transfer(msg.sender, requester, requiredFee);

        usedResponseIds[requestId] = true;
        responses[requestId] = Response({dataLocation: dataLocation});  
    }
}
