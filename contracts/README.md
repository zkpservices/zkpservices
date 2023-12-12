
# ZKPServicesCore

Please consult our protocol [overview](https://zkp.services/overview) as well as the other guides on our site and in this repository for a high level overview of this smart contract and its purpose. For a deeper technical overview, please consult our protocol [blueprint](https://zkp.services/blueprint).

## Overview
`ZKPServicesCore` is a robust smart contract built for EVM-compatible chains written in Solidity. The contract serves as an advanced data management system leveraging cryptographic proofs and two-factor authentication mechanisms. It blends the power of decentralized platforms with various encryption and obfuscation techniques, providing a secure medium to request, update, and validate obfuscated data in a privacy-preserving manner.

## Features
### 1. Token System (covered in more detail on site guide)
The tokenomics aspect is just implemented for testing to demonstrate token utility - however they are covered on our site in the [tokenomics guide](https://www.zkp.services/overview)
- **ERC20Burnable Token:** Built on the ERC20 standard with burn capabilities.
- **Token Distribution:** Upon deployment, all of the ZKP tokens are allocated to the contract itself.
- **Vault System:** Allows users to request a limited amount of tokens from the contract's vault to act as a faucet for testing.

### 2. Data Management:
- **Data Storage:** Store obfuscated (hashed) data linked to a unique identifier.
- **Two-Factor Authentication (2FA):** Enhanced security by integrating with different 2FA providers.
- **Data Requests:** Encrypted data requests that are accessible only by designated recipients.
- **Data Updates:** Encrypted requests for data modifications.
- **RSA Key Registration:** Users can register their RSA public keys, enabling data encryption, decryption, and signing.

### 3. Zero-Knowledge Proofs:
- Uses the Groth16 verification system to ensure data authenticity without revealing the actual data.

### 4. Cross-Chain Functionality:
- Allows users to send their smart contract data to other chains.

## Functions Breakdown

### Constructor
Initializes the contract, sets the Groth16 verifier, mints the total ZKP tokens supply, and defines the request and response fees. Sets the CCIP variables for Chainlink-supported chains.

### Public Functions
- **`requestVaultTokens`**: Allows users to retrieve a limited number of tokens from the contract's vault.
- **`setRSAKey`**: Enables users to register their RSA public key.
- **`setObfuscatedData`**: Store obfuscated data and its associated signature.
- **`addTwoFAProvider` & `removeTwoFAProvider`**: Functions for the owner to manage approved 2FA providers.
- **`requestData` & `requestUpdate`**: Functions for users to initiate encrypted data requests or updates.
- **`respond`**: Used by users to answer requests or updates using zero-knowledge proofs for data verification.

## Security & Authentication
- **Zero-Knowledge Proofs (ZKP):** Provides a way to verify the authenticity of obfuscated data without revealing the actual data.
- **Custom 2FA:** An additional layer of security to validate data requests and updates.
- **RSA & AES Encryption:** Ensures encrypted data transfer and allows for digital signatures, only accessible by designated recipients.

## Advantages
- **Data Privacy:** Only hashed data is stored, preserving data confidentiality.
- **Enhanced Security:** Incorporates security techniques such as salted hashes and ZKPs for obfuscation as well as RSA, AES encryption, and two-factor authentication.
- **Decentralized System:** Utilizes the strengths of decentralized platforms to ensure data transparency and integrity.
- **Economic Incentives:** Uses the ZKP token system to ensure participants are compensated or penalized for their actions within the ecosystem.

ZKPServicesCore offers a new paradigm in secure data management. By seamlessly integrating zero knowledge proofs, advanced encryption and obfuscation techniques, and custom multi-factor authentication, the contract provides a sophisticated tool for Web3 developers seeking a reliable and secure data management solution.
