pragma circom 2.0.3;

include "../circomlib/circuits/poseidon.circom";

template TwoFactor () {
  
    /* Example input.json
    {
        "random_number": "5555555555",
  	    "two_factor_secret": "2344444444892374928374293847293847239847", 
        "secret_hash": "4100012361767618531236452365885882414146447511956997053820620428697084077327"
    }*/

    signal input random_number;
    signal input two_factor_secret;
    signal input secret_hash;
  
  	//log(random_number);
  	//log(two_factor_secret);
  	//log(secret_hash);
  
    component hash = Poseidon(1);
    hash.inputs[0] <== two_factor_secret;
  
  	//log(hash.out);
  
   	random_number === random_number;
	  hash.out === secret_hash;
}

component main { public [ random_number, secret_hash ] } = TwoFactor();