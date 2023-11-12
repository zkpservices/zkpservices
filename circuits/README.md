#### Circom playground:

https://play.zkaccel.io/

#### Circom installation

https://docs.circom.io/getting-started/installation/

#### Circomlib (helper library) source code

https://github.com/iden3/circomlib/

#### Reference for poseidon hasher example - we use Poseidon Hash because it's more efficient for ZKPs

https://betterprogramming.pub/zero-knowledge-proofs-using-snarkjs-and-circom-fac6c4d63202

#### Compiling a circuit:

`circom poseidon_hasher.circom --wasm --r1cs -o ./build`

#### Generating proving key (zkey):

`npx snarkjs groth16 setup build/*.r1cs ../*.ptau circuit_0000.zkey` in the circuit's folder, zkey name is whatever you choose

#### Proof generation (adjust input values and circuit/key folder/file names as appropriate, pass integer inputs as strings to avoid problems w/BigInt):

`const { proof, publicSignals } = await snarkjs.groth16.fullProve({ "input_val": 15 }, "build/circuit_name_js/circuit_name.wasm", "circuit_key_file.zkey");`

#### Verification key generation (.json):

`npx snarkjs zkey export verificationkey circuit_key_file.zkey verification_key.json`

#### Proof verification:

`const vKey = JSON.parse(fs.readFileSync("verification_key.json"));`
`const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);`

#### Hash computation:

`const poseidon = await circomlibjs.buildPoseidon();`
`const hash = poseidon.F.toString(poseidon([10]));` where `10` is a random integer input that can be expressed with 253 bits or fewer and can be `[a,b,c,d]`, etc. to hash multiple values

to be safe, each of a, b, c, etc. can be a 30-byte string that is cast to a uint256 input to the function - pass large integers like 10**20 inside quotes
