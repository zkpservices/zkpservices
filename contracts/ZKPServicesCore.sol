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
        uint256 timeLimit;
        address _2FAProvider;                // Address of 2FA provider
        address requester;  
        uint256 responseFeeAmount;  
    }

    struct UpdateRequest {
        string encryptedRequest;            // AES encrypted request
        string encryptedKey;                // AES key encrypted with RSA public key of recipient
        string newHash;
        Signature signature;
        uint256 timeLimit;
        address _2FAProvider;                // Address of 2FA provider
        address requester;
        uint256 responseFeeAmount;  
    }

    IGroth16VerifierP2 public responseVerifier;
    mapping(address => RSAKey) public rsaKeys;
    mapping(uint256 => Data) public obfuscatedData;  
    mapping(uint256 => DataRequest) public dataRequests;
    mapping(uint256 => UpdateRequest) public updateRequests;
    mapping(address => uint256) public vaultBalance;
    mapping(address => ITwoFactor) public _2FAProviders;
    mapping(address => address) public _2FAProviderOwners; 


    uint256 private constant TOTAL_SUPPLY = 10000000000;
    uint256 private constant VAULT_AMOUNT = TOTAL_SUPPLY / 2;

    constructor(address _groth16Verifier) ERC20("ZKPServices", "ZKP") {
        responseVerifier = IGroth16VerifierP2(_groth16Verifier);
        _mint(msg.sender, VAULT_AMOUNT);
        _mint(address(this), VAULT_AMOUNT);
        requestFee = 1 ether;  
        responseFee = 1 ether; 
    }

    function requestVaultTokens() external {
        vaultBalance[msg.sender] += 200;
        _transfer(address(this), msg.sender, 200);
    }

    function setRSAKey(string memory rsaKey) external {
        rsaKeys[msg.sender] = RSAKey(rsaKey);
    }

    function setObfuscatedData(uint256 hashedField, string memory dataHash, Signature memory signature) external {
        obfuscatedData[hashedField] = Data(dataHash, signature);
    }

    function addTwoFAProvider(address provider) external {
        require(_2FAProviders[provider] == ITwoFactor(address(0)), "Provider already exists");
        _2FAProviders[provider] = ITwoFactor(provider);
        _2FAProviderOwners[provider] = msg.sender;
    }

    function removeTwoFAProvider(address provider) external {
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
        require(balanceOf(msg.sender) >= requestFee, "Not enough ZKP tokens for request fee.");
        _burn(msg.sender, requestFee);
        dataRequests[requestId] = DataRequest(encryptedRequest, encryptedKey, block.timestamp + timeLimit, _2FAProvider, msg.sender, responseFeeAmount);
    }

    function requestUpdate(
        uint256 dataLocation,
        string memory encryptedRequest,
        string memory newHash,
        Signature memory signature,
        uint256 timeLimit,
        string memory encryptedKey,
        address _2FAProvider,
        uint256 responseFeeAmount
    ) external {
        require(balanceOf(msg.sender) >= requestFee, "Not enough ZKP tokens for request fee.");
        _burn(msg.sender, requestFee);
        updateRequests[dataLocation] = UpdateRequest(encryptedRequest, encryptedKey, newHash, signature, block.timestamp + timeLimit, _2FAProvider, msg.sender, responseFeeAmount);
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
        uint256 requiredFee = isUpdate ? updateRequests[requestId].responseFeeAmount : dataRequests[requestId].responseFeeAmount; 
        require(balanceOf(msg.sender) >= requiredFee, "Not enough ZKP tokens for response fee.");
        uint256 requestTimeLimit = isUpdate ? updateRequests[requestId].timeLimit : dataRequests[requestId].timeLimit;
        address _2FAProvider = isUpdate ? updateRequests[requestId]._2FAProvider : dataRequests[requestId]._2FAProvider;

        require(requestTimeLimit >= block.timestamp, "Request has expired.");

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
    }
}
