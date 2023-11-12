pragma circom 2.0.3;

include "../circomlib/circuits/poseidon.circom";

template ZKPServicesVRF2FAPasswordChange () {
  
    /* Example input.json
    {
        "old_secret": "50070065032111108100032115101099114101116032112097115115119111114100",
        "old_secret_hash": "21146907112501323579994721454375059997913310776020284450343052808901418420223", 
        "new_secret": "50070065032110101119032115101099114101116032112097115115119111114100",
        "new_secret_hash": "19546085206035457027199582471272946937474843328562233437592300499317709218241"
    }*/

    signal input old_secret;
  	signal input old_secret_hash;
	signal input new_secret;
  	signal input new_secret_hash;
  
    //log(old_secret);
    //log(old_secret_hash);
    //log(new_secret);
  	//log(new_secret_hash);
  
    component hash_old = Poseidon(1);
    component hash_new = Poseidon(1);

    hash_old.inputs[0] <== old_secret;
    hash_new.inputs[0] <== new_secret;

    //log(hash_old.out);
    //log(hash_new.out);

    hash_old.out === old_secret_hash;
    hash_new.out === new_secret_hash;
}

component main { public [ old_secret_hash, new_secret_hash ] } = ZKPServicesVRF2FAPasswordChange();