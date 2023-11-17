pragma circom 2.0.3;

include "../circomlib/circuits/poseidon.circom";

template ZKPServicesCoreResponse() {
  
    /* Example input.json
    {
      "field_0": "115116032107105108100097032112104097114109097099121032114101099111114100115",
      "field_1": "0",
      "field_salt": "106102119048057056052051112104102119048057052051055103053104102106056113", 
      "one_time_key": "102106056057119112051102104119048051056055104102112119057051056",
      "user_secret_0": "115109097114116032099111110116114097099116032112097115115119111114100",
      "user_secret_1": "0",
      "provided_field_and_key_hash": "12691112582188277588327973364953120405817167370333030099821523169953267359557",
      "provided_field_and_salt_and_user_secret_hash": "10931149326158357723704937538455591874147566815322430603391219695221726864571",
      "provided_salt_hash": "1387659474001589605887359808563316522820339430517223941727046779206566319823"
    }*/

    //field = field_0 ++ field_1 to facilitate up to 50 ASCII characters
    signal input field_0;
    signal input field_1;
    //the field salt obfuscates storage location/key in smart contract in case user secret gets leaked
    signal input field_salt;
    //one time key is used to ensure one time use of the ZKP in the smart contract
    signal input one_time_key;
    //user_secret = user_secret_0 ++ user_secret_1 to facilitate up to 50 ASCII characters
    signal input user_secret_0;
    signal input user_secret_1;

    signal input provided_field_and_key_hash;
    signal input provided_field_and_salt_and_user_secret_hash;
    signal input provided_salt_hash;
  
    //log(field_0);
    //log(field_1);
    //log(field_salt);
    //log(one_time_key);
    //log(user_secret_0);
    //log(user_secret_1);
    //log(provided_field_and_key_hash);
    //log(provided_field_and_salt_and_user_secret_hash);
    //log(provided_salt_hash);

    //verify field (and key, to verify it is a timely request)
    component hash_field_and_key = Poseidon(3);
    //verify valid storage location in smart contract
    component hash_field_and_salt_and_secret = Poseidon(5);
    //verify hashing salt above for additional obfuscation
    component hash_salt = Poseidon(1);

    hash_field_and_key.inputs[0] <== field_0;
    hash_field_and_key.inputs[1] <== field_1;
    hash_field_and_key.inputs[2] <== one_time_key;

    //log(hash_field_and_key.out);

    hash_field_and_salt_and_secret.inputs[0] <== field_0;
    hash_field_and_salt_and_secret.inputs[1] <== field_1;
    hash_field_and_salt_and_secret.inputs[2] <== field_salt;
    hash_field_and_salt_and_secret.inputs[3] <== user_secret_0;
    hash_field_and_salt_and_secret.inputs[4] <== user_secret_1;
  
    //log(hash_field_and_salt_and_secret.out);

    hash_salt.inputs[0] <== field_salt;

    //log(hash_salt.out);

    hash_field_and_key.out === provided_field_and_key_hash;
    hash_field_and_salt_and_secret.out === provided_field_and_salt_and_user_secret_hash;
    hash_salt.out === provided_salt_hash;
}

component main { public [ provided_field_and_key_hash, provided_field_and_salt_and_user_secret_hash, provided_salt_hash ] } = ZKPServicesCoreResponse();