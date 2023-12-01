steps:
	- set compiler to 0.8.22 and to use 200 optimizations, set EVM version to Paris
	- deploy the all contracts in `contracts/verifiers` for each network
	* create a subscription on vrf.chain.link and fund it with testnet link for each network
	* deploy `contracts/2FA/VRF.sol` to the chains you wish and that it is supported on, with params from resources
		- avalanche
		- polygon
	* add deployed VRF contract as a consumer of the VRF subscription on vrf.chain.link
	- deploy *`contracts/2FA/ZKPServicesVRF2FA.sol` (or `contracts/2FA/ZKPServicesVRF2FA.sol` on chains 
		that don't support chainlink) with relevant verifier addresses
	* authorize ZKPServicesVRF2FA address in VRF contract with the setAuthorized method
	- deploy `contracts/ZKPServicesCore.sol` with core response verifier address and *CCIPReceiverRouter
		address if CCIP is supported in this chain, otherwise put in 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
	- deploy `contracts/BatchSignUp.sol` with corresonding 2FA contract and core contract addresses
	- set batch sign up contract in all 2FA and core contracts by calling setBatchSignUpContractAddress with
		BatchSignUp contract address
	- call register2FAProvider in ZKPServicesCore with the ZKPServices 2FA contract address
	* register VRF contract with automation.chain.link and fund it with testnet link 
	* fund ZKPServicesCore contract itself with LINK
	* call setSender in ZKPServicesCore with the router address and LINK address for each network
	* call setReceiver in ZKPServicesCore with some string shorthand such as "fuji"/"mumbai", etc. and appropriate 
		destination chain selector
		set your fee - such as 10 ZKP = 10000000000000000000 (18 decimal precision)
		
		we support avalanche fuji testnet and polygon mumbai testnets for now so we set those and they are usable
		by default in our dApp's source code
	* call setOriginPolicy for senders from other chains appropriately to allow receiving CCIP messages
	
	- modify our dApp source code if you are running a local instance or spinning up your own instances as follows:
		- change all references to the core contract, 2FA contract, and batch sign up contract addresses to
			match the addresses you deployed
		- change all references to chainIds for the EVM-compatible chains you will be using
		- change all references to the contract names/instances if relevant and for ease of use
		- change the `site/client/src/components/NewCrossChainSyncModal` to contain string shorthands such as 
			"mumbai", "fuji", etc. as needed
	
* refers to steps necessary for chains that support chainlink services - CCIP needs to be supported for some

chainlink variables:

avalanche fuji keyhash: 0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61
avalanche fuji VRF coordinator:0x2eD832Ba664535e5886b75D64C46EB9a228C2610
avalanche fuji VRF minimum confirmations: 1
avalanche fuji router address: 0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8
avalanche fuji chain selector: 14767482510784806043
avalanche fuji LINK address: 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846

polygon mumbai keyhash: 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f
polygon mumbai VRF coordinator: 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
polygon mumbai VRF minimum confirmations: 3
polygon mumbai router address: 0x70499c328e1E2a3c41108bd3730F6670a44595D1
polygon mumbai chain selector: 12532609583862916517
polygon mumbai LINK address: 0x326C977E6efc84E512bB9C30f76E30c160eD06FB

random address/burn address: 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF