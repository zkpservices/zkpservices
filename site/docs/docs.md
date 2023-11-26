##**How does zkp.services work?**

**A trustless, serverless, decentralized architecture**

zkp.services run entirely without dedicated or provisioned infrastructure in a completely trustless system. We've designed the underlying blueprint of zkp.services to be incredibly versatile and can be adapted to many different frameworks. We currently use serverless cloud-based resources for our API and main database, and our contracts are publicly available on-chain.

The dApp itself is also extremely malleable to the user and organizational requirements. We offer the ability to pick and choose services to be linked to a user's dashboard, meaning that you only need to communicate and share with the systems you choose. Our interface is incredibly user-friendly and straightforward: you can add or remove from a list of services at any time. This makes your dashboard very easy to manage and gives you an enhanced sense of security over your data. If you remove a service, your data and all parties you have chosen to share that data with are entirely removed from our system. Since we use a blockchain ledger in our backend, you can confidently verify this.

zkp.services offers plug-and-play functionality with an endless number of smart devices. This pushes our solution into the world of IoT, where users can share and control their data security from personal and wearable devices.

We go a step further with user customization by offering cross-chain functionality and the opportunity to onboard data from your *own* selected database, such as one hosted in the Interplanetary File System (IPFS). We believe this is important as it aligns strongly with our mission to provide users with a way to securely handle their data in a decentralized and trustless world where the user is truly in control.

**Storing data securely and redundantly**

With zkp.services, your data is reliably stored with security and redundancy in mind. We utilise the decentralized nature of the blockchain to ensure all communications and data transfers are safely handled at rest and in-transit. With our default database, your data is stored at rest using 256-bit AES-GCM across multiple availability zones, ensuring the prolixity of your information. Data stored on-chain is secured using a combination of one-time hashes and keys, meaning your information is protected without a single point of failure.

**Encrypting communications**

All data in transit is incredibly protected by multiple encryption methods, ensuring that your information is kept safe even in the improbable event of a single point of malicious decryption being compromised. Communications with our main API and database are first encrypted using 256-bit AES (@machin3boy, tbc), then wrapped strictly through TLS. This means that compromising data in-transit through an MITM attack is essentially impossible. Furthermore, all communications to our smart contract are encrypted using a combination of hashing and one-time keys, which fulfils the zero-knowledge component of our solution. As this data is stored on-chain, we have made it this way so that malicious communication decryption is impossible.

**2FA and Sybil Attack Resistance Policies**

A Sybil attack involves a malicious actor generating numerous duplicate accounts to masquerade as genuine users. This tactic complicates the system\'s ability to ascertain the true user count within the network accurately. While anyone can execute this attack, it typically unfolds when an individual seeks to initiate a transaction while ensuring that the action is attributed to them and not an imposter. They fabricate multiple accounts and employ them concurrently to carry out transactions to achieve this. This attack variation aims to exploit fellow users by assuming their identity and leveraging their account credentials for digital possessions. As an illustration, an individual might forge an account with a high reputation rating to present themselves as possessing more wealth or followers than they genuinely do.

To prevent such attacks on our system, we have created our own novel two-factor authentication system, which integrates with Chainlink to protect our users from malicious users. Our 2FA system utilizes the Chainlink Verifiable Random Function to generate a true random number, allowing authorized contracts to request random numbers. Users would then be required to prove they have the same random number. This is similar to many commonly used MFA apps; however, ours is entirely on-chain and, therefore, decentralized and trustless.

**Leveraging ZKPs to store proofs of data and verifying updates to
data**

The use of zero-knowledge proofs is a core component of our solution. A zero-knowledge proof or ZKP is a method by which one party can prove to another party that a given statement is true while avoiding conveying any information beyond the mere fact of the statement\'s truth to the verifier. The reason this protocol is so paramount to securely storing and sharing data is that it allows the complex process of verifying requests and responses for data to be done in an airtight, obfuscated manner, where critical fields can stay undisclosed whilst still ensuring complete authenticity of the information.

\[BETA\] We go a step further by offering the ability for users to specify their own ZKP verifier contracts and interfaces. This aligns strongly with our mission to provide users with the ability to store and share data in a fully trustless and decentralized manner. This gives users a stronger sense of ownership and allows verifiers to tune the level of obfuscation to their requirements by specifying their own ZKP interfaces.

**Onboarding and updating data with the smart contract**

Updating and onboarding data to the zkp.services solution involves a simple user interaction on the dApp; however, a complex and highly secure set of operations occurs internally. After the user submits an update from the dApp, both the field being updated and the new data itself are hashed and then placed into a compounded zero-knowledge proof (meaning that the information is verifiable without revealing itself). Once pushed, the obfuscated field and data can be safely verified that the data is correctly updated and matches what was presented in the update request without revealing the data.

**Sharing and proving ownership of the data with the smart contract**

The process of a user sharing data with a trusted verifier begins with the verifier posting a request to the user of the field of information wanted, which is, as always, encrypted securely with a one-time key.

When a user receives a request to share their data, it will be presented as a notification on their dApp interface. The user can simply accept or deny the request. Internally, when a user accepts the request, the user posts a zero-knowledge proof of the hash of the requested field with a one-time key. This verifies that the field is valid and that the data is proven for the request due to our one-time key. Our smart contract will store the result of this submission, ensuring that the request is only valid for a single time. Once it has expired, it cannot be used again.

The response containing the actual data is then posted directly to the verifier, securely encrypted with the verifier's public key. The verifier can then check that the hash matches what is stored in the smart contract, verifying the response.

Additionally, our custom 2FA system can be optionally included for a specific request for a verifier. This can be particularly useful when there is a request for critical data that is more susceptible to Sybil attacks, such as requesting passport information.

**Using the smart contract privately** 

The zkp.services solution conceals the fields/data stored by default, using compounding encryption/hashing and zero-knowledge proofs. This ensures that all on-chain communications are intelligible to those outside the one-to-one interaction between the user and the verifier. We believe that our solution is ground-breaking in this aspect, as safely sharing critical information across the blockchain has not been demonstrated until now (@machin3boy, please verify ).

We also offer the ability to include a composition of oracles and proxies, fully customizable by the user or verifier, for enhanced protection. This means that for particular use cases about highly critical or classified data, these additional oracles/proxies can be leveraged to include more obfuscating steps in sharing and updating data.

**Tokenomics \[BETA\]**

zkp.services by default runs on \[coin name\], which is our own native ERC-20 token. Verifiers and users can both be receivers or senders of the token based on the nature of the data transaction. Generally, the party requesting the data will be charged for the request, but this may vary by case. The receiving party can determine the transaction cost, but the amount is limited to the highly minimal cost for the service provided. As always, the party supplying tokens for the transaction is always in control and can accept or deny each request.

In conjunction with implementing the Chainlink Cross-Chain Interoperability Protocol (CCIP), we offer the ability to fund transactions with a token of your choice from a list of approved coins. This further aligns with our mission to provide a customizable method for users to share and store their data in a trustless manner -- they are not obliged to use only our native token.
