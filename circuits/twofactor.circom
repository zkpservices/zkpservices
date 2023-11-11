include "circomlib/circuits/sha256/sha256.circom";

template ProofCircuit() {
    signal input random;
    signal private input secret;
    signal input hash;

    component hasher = SHA256(256);
    hasher.in <== secret;
    
    signal output isVerified;
    isVerified <== hash === hasher.out && random === random;
}

component main = ProofCircuit();
