pragma circom 2.0.0;

include "../circomlib/circuits/poseidon.circom";

template PoseidonHasher() {
    signal input in;
    signal input hash;

    log(in);
    log(hash);
    
    component poseidon = Poseidon(1);
    poseidon.inputs[0] <== in;
    log(poseidon.out);
    hash === poseidon.out;

}

component main {public [hash]} = PoseidonHasher();