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

leverage calls to public view hash functions in the helper smart contracts in `/contracts/hashers/` directory to make them accessible in the browser more easily (client-side only)

`const poseidon = await circomlibjs.buildPoseidon();`
`const hash = poseidon.F.toString(poseidon([10]));` where `10` is a random integer input that can be expressed with 253 bits or fewer and can be `[a,b,c,d]`, etc. to hash multiple values

to be safe, each of a, b, c, etc. can be a 30-byte string that is cast to a uint256 input to the function - pass large integers like 10**20 inside quotes

#### Solidity verifier: 

`npx snarkjs zkey export solidityverifier *.zkey verifier.sol` in the circuit's folder - you can name the Solidity file differently

to prove with solidity, the proof and publicSignals need to be supplied to the smart contract
