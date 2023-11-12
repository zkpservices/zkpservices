#### Circom playground:

https://play.zkaccel.io/

#### Circom installation:

https://docs.circom.io/getting-started/installation/

#### Circomlib (helper library) source code (it's already available in the repository for access to `poseidon.circom`):

https://github.com/iden3/circomlib/

#### Reference for Poseidon hasher example - we use the Poseidon hash because it's extremely efficient for ZKPs:

https://betterprogramming.pub/zero-knowledge-proofs-using-snarkjs-and-circom-fac6c4d63202

#### Dependencies:

You can get `snarkjs` and `circomlibjs` with `npm install`, and circom from the reference above

#### Compiling a circuit (in the circuit's folder):

`mkdir build` </br>
`circom <circuit-name>.circom --wasm --r1cs -o ./build`

#### Generating proving key (zkey):

`npx snarkjs groth16 setup build/*.r1cs ../*.ptau <circuit-key-name>.zkey` in the circuit's folder, zkey name is whatever you set

#### Proof generation (adjust input values and circuit/key folder/file names as appropriate, pass integer inputs as strings to avoid problems w/BigInt):

see the `/helpers` directory for examples directly in the browser (client-side)

`const { proof, publicSignals } = await snarkjs.groth16.fullProve({ "input_val": 15 }, "build/circuit_name_js/circuit_name.wasm", "circuit_key_file.zkey");`

#### Verification key generation (.json):

`npx snarkjs zkey export verificationkey *.zkey verification_key.json`

#### Proof verification:

see the `/helpers` directory for examples directly in the browser (client-side)

`const vKey = JSON.parse(fs.readFileSync("verification_key.json"));`
`const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);`

#### Hash computation:

Circomlibjs is not very easily exposed in the browser, however it's relatively easy to use with Node:

`const poseidon = await circomlibjs.buildPoseidon();`
`const hash = poseidon.F.toString(poseidon([10]));` where `10` is a random integer input that can be expressed with 253 bits or fewer and can be `[a,b,c,d]`, etc. to hash multiple values

to be safe, each of a, b, c, etc. can be a 30-byte string that is cast to a uint256 input to the function - pass large integers like 10**20 inside quotes

Exposing the hash functions in the browser client-side

1. **Use Keccak256 Function from Modern Web3 Libraries and Poseidon Function via WASM**:
   This option offers a more secure and efficient approach to compute hashes directly on the client-side. You can leverage the `keccak256` function provided by modern Web3 libraries to calculate Keccak256 hashes within the web browser. Additionally, you can use the Poseidon function exposed through WebAssembly (WASM) available in the `/helpers/poseidon` directory to compute Poseidon hashes directly within the client-side code. This option is recommended for production use.

2. **Use Public View Hash Functions in Helper Smart Contracts (For Testing Only)**:
   An alternative option is to utilize calls to public view hash functions available in the helper smart contracts located in the `/contracts/hashers/` directory. However, it's crucial to emphasize that these functions are generally intended for testing purposes only. Relying on them in production may not be recommended due to potential security concerns. It's preferable to opt for the first option when computing hashes in a production environment.

#### Solidity verifier: 

`npx snarkjs zkey export solidityverifier *.zkey verifier.sol` in the circuit's folder - you can name the Solidity file differently

to prove with solidity, the proof and publicSignals need to be supplied to the smart contract

#### Combined:

- `mkdir build` 
- `circom *.circom --wasm --r1cs -o ./build`
- `npx snarkjs groth16 setup build/*.r1cs ../*.ptau circuit.zkey`
- `npx snarkjs zkey export verificationkey *.zkey verification_key.json`
- `npx snarkjs zkey export solidityverifier *.zkey verifier.sol`

Or, navigate to the target circuit folder and run `snark_setup.sh`