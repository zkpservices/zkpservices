
## Custom Multi-Factor Authentication

Please consult the multi-factor authentication [page](https://zkp.services/mfa) on our site for a further walkthrough of some functions and their purpose.

### Overview

This repository provides an example of how to create a robust and secure custom multi-factor authentication system using ZKPs and Chainlink VRF (Verifiable Random Function) and Automation for chains on which Chainlink is supported. The smart contract, `ZKPServicesVRF2FA`, utilizes a VRF call to request an unpredictable random number in a timed request, resulting in a secure and tamper-resistant authentication process due to the guaranteed random and timely entropy. `ZKPServicesVRF2FA` and `ZKPServicesGeneric2FA` both make use of a ZKP verifier to which a zero knowledge proof of the knowledge of some user secret needs to be supplied in order to fulfill the MFA requirements, however the `ZKPServicesGeneric2FA` contract doesn't have the advantage of the randomness, which serves the security advantage of guaranteeing a ZKP is not reused and further guarantees timeliness. 

### The Role of the 2FA Secret

In this 2FA implementation, the user's 2FA secret plays a critical role. This secret, which is hashed and securely stored within the contract, forms the second factor in this authentication process. The combination of the 2FA secret and the unpredictable random number generated from Chainlink VRF provides a proof of timely knowledge of the secret. This dual-factor requirement makes this 2FA system highly secure against potential attacks.

### How does it work?

The `ZKPServicesVRF2FA` and `ZKPServicesGeneric2FA` smart contract allows users to initiate unique 2FA requests, each associated with a hashed one-time key. When a random number is needed, the contract calls upon the Chainlink VRF. This random number, combined with the user's 2FA secret, forms the basis of a Zero-Knowledge Proof (ZKP) verification (the random number can be any number for the generic 2FA contract). The ZKP verifier verifies that both the user secret and the random number match the public signals, thereby confirming the authenticity of the 2FA request.

### Leveraging Chainlink VRF

Chainlink offers a suite of tools designed to secure and enhance smart contract functionality. The Verifiable Random Function (VRF), a proven source of randomness, is one such tool. It plays a crucial role in ensuring fairness and security in smart contracts. In this 2FA implementation, the Chainlink VRF is used to provide an unpredictable, tamper-resistant random number, forming an essential part of the 2FA verification process.

### Leveraging Chainlink Automation  

The VRF in our examples serve as the source of entropy for a window of blocks in which all MFA requests are able to use this source of entropy scalably. This means that no matter whether 1 or 1,000,000 MFA requests are made in a given window of blocks to our MFA provider, only one VRF request call is needed, making the provider more economical and scaleable. Chainlink Automation is responsible for checking if "upkeep is needed" - that is, whether a VRF is required in the next window and if it hasn't been requested already. Thus, at most, 1 automation call and 1 VRF call are made per window of blocks and the ZKPs are leveraged to prove the knowledge of a user secret password in a timely manner.  

### Expanding MFA Capabilities With Chainlink

Chainlink's tools and capabilities extend beyond the VRF used in this example. With Chainlink's oracles and external adapters, developers can create highly secure, custom 2FA processes tailored to unique requirements. For instance, Chainlink's external adapters could be used to interface with APIs or perform complex off-chain computations. This flexibility could even extend to include biometric checks, where a custom adapter could verify biometric data like a fingerprint or face scan and return the verification result to the smart contract. This shows the potential to create an advanced, highly secure 2FA process that goes beyond traditional methods.

### Integration with Other Contracts

The `ITwoFactorStatus` interface in this repository enables other contracts to leverage this 2FA system. This adaptability allows for customized logic for various 2FA requirements, making it possible for other smart contracts to build on top of this system for a multitude of applications.


### Chainlink VRF setup

- [Guide for VRF variables for smart contract](https://docs.chain.link/vrf/v2/subscription/supported-networks)
- [Guide to set up the random number generation smart contract](https://docs.chain.link/vrf/v2/subscription/examples/get-a-random-number)
- [VRF Subscription manager](https://vrf.chain.link/)

