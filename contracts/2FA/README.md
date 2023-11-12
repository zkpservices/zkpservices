
## Two-Factor Authentication (2FA) Using Chainlink 

### Overview

This repository provides an example of how to create a robust and secure custom two-factor authentication (2FA) system using Chainlink VRF (Verifiable Random Function). The smart contract, `ZKPServicesVRF2FA`, utilizes a user secret and a VRF to generate an unpredictable random number for a timed request, resulting in a secure and tamper-resistant authentication process.

### The Role of the 2FA Secret

In this 2FA implementation, the user's 2FA secret plays a critical role. This secret, which is hashed and securely stored within the contract, forms the second factor in this authentication process. The combination of the 2FA secret and the unpredictable random number generated from Chainlink VRF provides a proof of timely knowledge of the secret. This dual-factor requirement makes this 2FA system highly secure against potential attacks.

### How does it work?

The `ZKPServicesVRF2FA` smart contract allows users to initiate unique 2FA requests, each associated with a hashed one-time key. When a random number is needed, the contract calls upon the Chainlink VRF. This random number, combined with the user's 2FA secret, forms the basis of a Zero-Knowledge Proof (ZKP) verification. The ZKP process verifies that both the user secret and the random number match the public signals, thereby confirming the authenticity of the 2FA request.

### Leveraging Chainlink VRF

Chainlink offers a suite of tools designed to secure and enhance smart contract functionality. The Verifiable Random Function (VRF), a proven source of randomness, is one such tool. It plays a crucial role in ensuring fairness and security in smart contracts. In this 2FA implementation, the Chainlink VRF is used to provide an unpredictable, tamper-resistant random number, forming an essential part of the 2FA verification process.

### Expanding 2FA Capabilities With Chainlink

Chainlink's tools and capabilities extend beyond the VRF used in this example. With Chainlink's oracles and external adapters, developers can create highly secure, custom 2FA processes tailored to unique requirements. For instance, Chainlink's external adapters could be used to interface with APIs or perform complex off-chain computations. This flexibility could even extend to include biometric checks, where a custom adapter could verify biometric data like a fingerprint or face scan and return the verification result to the smart contract. This shows the potential to create an advanced, highly secure 2FA process that goes beyond traditional methods.

### Integration with Other Contracts

The `ITwoFactorStatus` interface in this repository enables other contracts to leverage this 2FA system. This adaptability allows for customized logic for various 2FA requirements, making it possible for other smart contracts to build on top of this system for a multitude of applications.

### Final Thoughts

This example demonstrates just one of many potential ways to implement secure 2FA using Chainlink's VRF. However, the possibilities for secure custom 2FA are expanded greatly with the use of Chainlink's oracles and external adapters. These tools offer the capability to create advanced authentication methods, such as biometric checks, demonstrating the vast potential applications of Chainlink for enhancing user authentication security.

### Chainlink VRF setup

- [Guide for VRF variables for smart contract](https://docs.chain.link/vrf/v2/subscription/supported-networks)
- [Guide to set up the random number generation smart contract](https://docs.chain.link/vrf/v2/subscription/examples/get-a-random-number)
- [VRF Subscription manager](https://vrf.chain.link/fantom-testnet)

#### Faucets:

[Fantom](https://faucet.fantom.network)

[Chainlink](https://faucets.chain.link/fantom-testnet)

#### Creating a VRF consumer

-  Create a new subscription: https://vrf.chain.link/fantom-testnet/new
-  Navigate to subscription in subscriptions view
-  Fund the subscription with LINK
-  Deploy `vrf.sol` with the subscription ID
-  Add deployed contract as consumer in subscription view
-  Set the `authorized` dictionary bool to `true` for other addresses that may use the random number retrieval functionality
