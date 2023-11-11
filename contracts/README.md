### Chainlink VRF setup

[Guide for VRF variables for smart contract](https://docs.chain.link/vrf/v2/subscription/supported-networks)

[Guide to set up the random number generation smart contract](https://docs.chain.link/vrf/v2/subscription/examples/get-a-random-number)

[VRF Subscription manager](https://vrf.chain.link/fantom-testnet)

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
