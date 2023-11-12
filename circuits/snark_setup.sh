mkdir build
circom *.circom --wasm --r1cs -o ./build
npx snarkjs groth16 setup build/*.r1cs ../*.ptau circuit.zkey
npx snarkjs zkey export verificationkey *.zkey verification_key.json
npx snarkjs zkey export solidityverifier *.zkey verifier.sol
