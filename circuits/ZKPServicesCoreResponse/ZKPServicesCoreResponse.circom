pragma circom 2.0.3;

include "../circomlib/circuits/poseidon.circom";

template ZKPServicesCoreResponse() {
  
    /* Example input.json
    {
      "field_0": "112104097114109097099121032112114101115099114105112116105111110115",
      "field_1": "0",
      "field_salt": "5207398475230475230947523094752345324520937523984752375", 
      "one_time_key": "25234982346239465239465298437652987439236529834652983465",
      "user_secret_0": "122107112032115101114118105099101115032115101099114101116",
      "user_secret_1": "0",
      "provided_field_and_key_hash": "1718462366685722608884256218768724031358964451016425774228480187160503350133",
      "provided_field_and_user_secret_hash": "7438849333937668135947469324270400989106436768631423221080613740049838417023"
    }*/

    //field = field_0 ++ field_1 to facilitate up to 50 ASCII characters
    signal input field_0;
    signal input field_1;
    signal input field_salt;
    signal input one_time_key;
    //user_secret = user_secret_0 ++ user_secret_1 to facilitate up to 50 ASCII characters
    signal input user_secret_0;
    signal input user_secret_1;

    signal input provided_field_and_key_hash;
    signal input provided_field_and_user_secret_hash;
  
    //log(field);
    //log(field_salt);
    //log(one_time_key);
    //log(user_secret);
    //log(provided_field_and_key_hash);
    //log(provided_field_and_user_secret_hash);

    component hash_field_and_key = Poseidon(4);
    component hash_field_and_secret = Poseidon(5);

    hash_field_and_key.inputs[0] <== field_0;
    hash_field_and_key.inputs[1] <== field_1;
    hash_field_and_key.inputs[2] <== field_salt;
    hash_field_and_key.inputs[3] <== one_time_key;

    //log(hash_field_and_key.out);

    hash_field_and_secret.inputs[0] <== field_0;
    hash_field_and_secret.inputs[1] <== field_1;
    hash_field_and_secret.inputs[2] <== field_salt;
    hash_field_and_secret.inputs[3] <== user_secret_0;
    hash_field_and_secret.inputs[4] <== user_secret_1;
  
    //log(hash_field_and_secret.out);
  
    hash_field_and_key.out === provided_field_and_key_hash;
    hash_field_and_secret.out === provided_field_and_user_secret_hash;
}

component main { public [ provided_field_and_key_hash, provided_field_and_user_secret_hash] } = ZKPServicesCoreResponse();