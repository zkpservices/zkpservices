export function stringToBigInt(str) {
    if (str.length > 25) {
        throw new Error("String length must be 25 characters or less.");
    }
    let numStr = '';
    for (let i = 0; i < str.length; i++) {
        let ascii = str.charCodeAt(i);
        numStr += ascii.toString().padStart(3, '0');
    }
    return BigInt(numStr);
}

export function bigIntToString(bigInt) {
    let str = bigInt.toString();
    // Add leading zeros if necessary to make the length a multiple of 3
    while (str.length % 3 !== 0) {
        str = '0' + str;
    }
    let result = '';
    for (let i = 0; i < str.length; i += 3) {
        let ascii = parseInt(str.substr(i, 3), 10);
        result += String.fromCharCode(ascii);
    }
    return result;
}

export function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    let base64 = window.btoa(binary);
    let padding = 4 - (base64.length % 4);
    for (let i = 0; i < padding; i++) {
        base64 += '=';
    }
    return base64;
}

export function base64ToArrayBuffer(base64) {
    let paddingRemoved = base64.replace(/=/g, '');
    let binary_string = window.atob(paddingRemoved);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function generateRSAKeys() {
    let rsaKeyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"] 
    );

    let publicKey = await window.crypto.subtle.exportKey("spki", rsaKeyPair.publicKey);
    let privateKey = await window.crypto.subtle.exportKey("pkcs8", rsaKeyPair.privateKey);

    let publicKeyString = arrayBufferToBase64(publicKey);
    let privateKeyString = arrayBufferToBase64(privateKey);

    return {
        publicKey: publicKeyString,
        privateKey: privateKeyString
    };
}

export async function generateAESKey() {
    const aesKey = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
    
    const aesKeyExported = await window.crypto.subtle.exportKey("raw", aesKey);
    const aesKeyString = arrayBufferToBase64(aesKeyExported);
    
    return aesKeyString;
}

export async function generateRSASigningKeys() {
    const rsaSigningKeyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: "SHA-256"
        },
        true,
        ["sign", "verify"]
    );

    const publicKey = await window.crypto.subtle.exportKey("spki", rsaSigningKeyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey("pkcs8", rsaSigningKeyPair.privateKey);

    const publicKeyString = arrayBufferToBase64(publicKey);
    const privateKeyString = arrayBufferToBase64(privateKey);

    return {
        publicKey: publicKeyString,
        privateKey: privateKeyString
    };
}

export async function signMessage(message, privateKey) {
    const encodedMessage = new TextEncoder().encode(message);

    const signature = await window.crypto.subtle.sign(
        {
            name: "RSASSA-PKCS1-v1_5"
        },
        privateKey,
        encodedMessage
    );

    return arrayBufferToBase64(signature);
}

export async function verifySignedMessage(message, signatureBase64, publicKey) {
    const encodedMessage = new TextEncoder().encode(message);
    const signature = base64ToArrayBuffer(signatureBase64);

    const isValid = await window.crypto.subtle.verify(
        {
            name: "RSASSA-PKCS1-v1_5"
        },
        publicKey,
        signature,
        encodedMessage
    );

    return isValid;
}

export async function encryptAES(message, key) {
    const encoded = new TextEncoder().encode(message);
    const iv = new Uint8Array(12); // Initialize IV with all zeros (for simplicity)
    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encoded
    );
    return arrayBufferToBase64(ciphertext);
}

export async function decryptAES(ciphertext, key) {
    const iv = new Uint8Array(12); // Initialize IV with all zeros (for simplicity)
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        base64ToArrayBuffer(ciphertext)
    );
    const decryptedMessage = new TextDecoder().decode(decrypted);
    return decryptedMessage;
}


export async function encryptAESKeyWithRSA(aesKey, rsaPublicKey) {
    const aesKeyExported = await window.crypto.subtle.exportKey("raw", aesKey);
    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        rsaPublicKey,
        aesKeyExported
    );
    return arrayBufferToBase64(ciphertext);
}

export async function decryptAESKeyWithRSA(ciphertext, rsaPrivateKey) {
    const decryptedAESKey = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP"
        },
        rsaPrivateKey,
        base64ToArrayBuffer(ciphertext)
    );
    return arrayBufferToBase64(decryptedAESKey);
}


export async function importAESKey(aesKeyString) {
    if (aesKeyString === '') {
        return null;
    } else {
        const aesKeyBuffer = base64ToArrayBuffer(aesKeyString);
        return await window.crypto.subtle.importKey(
            "raw",
            aesKeyBuffer,
            {
                name: "AES-GCM",
            },
            true,
            ["encrypt", "decrypt"]
        );
    }
}

export async function importPublicKey(publicKeyString) {
    let publicKeyBuffer = base64ToArrayBuffer(publicKeyString);
    return await window.crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["encrypt"]
    );
}

export async function importPrivateKey(privateKeyString) {
    let privateKeyBuffer = base64ToArrayBuffer(privateKeyString);
    return await window.crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["decrypt"]
    );
}

export async function importRSASigningPublicKey(publicKeyString) {
    const publicKeyBuffer = base64ToArrayBuffer(publicKeyString);

    return await window.crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256"
        },
        true,
        ["verify"]
    );
}

export async function importRSASigningPrivateKey(privateKeyString) {
    const privateKeyBuffer = base64ToArrayBuffer(privateKeyString);

    return await window.crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256"
        },
        true,
        ["sign"]
    );
}

export function flattenObject(ob) {
  var toReturn = {};

  for (var i in ob) {
      if (!ob.hasOwnProperty(i)) continue;

      if ((typeof ob[i]) == 'object' && ob[i] !== null) {
          var flatObject = flattenObject(ob[i]);
          for (var x in flatObject) {
              if (!flatObject.hasOwnProperty(x)) continue;

              toReturn[i + '.' + x] = flatObject[x];
          }
      } else {
          toReturn[i] = ob[i];
      }
  }
  return toReturn;
};

export function sortObject(obj) {
  return Object.entries(obj)
    .sort((a, b) => {
      // Compare keys
      let comp = a[0].localeCompare(b[0]);
      if(comp !== 0)
        return comp;

      // If keys are equal, compare values
      return String(a[1]).localeCompare(String(b[1]));
    })
    .reduce((result, [key, value]) => {
      result[key] = value;
      return result;
    }, {});
}

export async function hashSHA256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function flattenJsonAndComputeHash(data) {
  let flatJson = flattenObject(JSON.parse(data));
  let sorted = sortObject(flatJson);

  let hashes = await Promise.all(
    Object.entries(sorted).map(async ([key, value]) => {
      let hash = await hashSHA256(key + value);
      return hash;
    })
  );

  let rootHash = await hashSHA256(hashes.join(''));
  return { sorted, hashes, rootHash };
}

export async function generateCoreProof(inputs) {
  const snarkjs = window.snarkjs;

  const input = {
    "field_0": inputs.field_0,
    "field_1": inputs.field_1,
    "field_salt": inputs.field_salt,
    "one_time_key_0": inputs.one_time_key_0,
    "one_time_key_1": inputs.one_time_key_1,
    "user_secret_0": inputs.user_secret_0,
    "user_secret_1": inputs.user_secret_1,
    "provided_field_and_key_hash": inputs.provided_field_and_key_hash,
    "provided_field_and_salt_and_user_secret_hash": inputs.provided_field_and_salt_and_user_secret_hash,
    "provided_salt_hash": inputs.provided_salt_hash
  };

  const circuitWasm = "/circuit_wasms_and_keys/ZKPServicesCoreResponse/build/ZKPServicesCoreResponse_js/ZKPServicesCoreResponse.wasm";
  const circuitZkey = "/circuit_wasms_and_keys/ZKPServicesCoreResponse/circuit.zkey";

  let vKey;
  const response = await fetch('/circuit_wasms_and_keys/ZKPServicesCoreResponse/verification_key.json');
  if (response.ok) {
      vKey = await response.json();
      console.log("vKey:", vKey);
  } else {
      console.error('Failed to fetch verification key.');
  }

  try {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, circuitWasm, circuitZkey);
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (isValid) {
      const _pA = [proof.pi_a[0], proof.pi_a[1]];
      const _pB = [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]]
      ];
      const _pC = [proof.pi_c[0], proof.pi_c[1]];
      const _pubSignals = publicSignals;

      const res = {
        result: "Verification OK",
        proof: {
          pi_a: _pA,
          pi_b: _pB,
          pi_c: _pC,
          pubSignals: _pubSignals
        }
      }

      console.log(res);

      return res;
    } else {
      return { result: "Invalid proof" };
    }
  } catch (error) {
    console.error(error);
    return { result: "Error occurred: " + error.toString() };
  }
}

export async function generate2FAProof(inputs) {
  const snarkjs = window.snarkjs;

  const input = {
    "random_number": inputs.random_number,
    "two_factor_secret": inputs.two_factor_secret,
    "secret_hash": inputs.secret_hash
  };

  const circuitWasm = "/circuit_wasms_and_keys/ZKPServicesVRF2FAResponse/build/ZKPServicesVRF2FAResponse_js/ZKPServicesVRF2FAResponse.wasm";
  const circuitZkey = "/circuit_wasms_and_keys/ZKPServicesVRF2FAResponse/circuit.zkey";

  let vKey;
  const response = await fetch('/circuit_wasms_and_keys/ZKPServicesVRF2FAResponse/verification_key.json');
  if (response.ok) {
      vKey = await response.json();
      console.log("vKey:", vKey);
  } else {
      console.error('Failed to fetch verification key.');
  }

  try {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, circuitWasm, circuitZkey);
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (isValid) {
      const _pA = [proof.pi_a[0], proof.pi_a[1]];
      const _pB = [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]]
      ];
      const _pC = [proof.pi_c[0], proof.pi_c[1]];
      const _pubSignals = publicSignals;

      const res = {
        result: "Verification OK",
        proof: {
          pi_a: _pA,
          pi_b: _pB,
          pi_c: _pC,
          pubSignals: _pubSignals
        }
      };
      console.log(res);
      return res;
    } else {
      return { result: "Invalid proof" };
    }
  } catch (error) {
    console.error(error);
    return { result: "Error occurred: " + error.toString() };
  }
}

export async function generatePasswordChangeProof(inputs) {
  const snarkjs = window.snarkjs;

  const input = {
    "old_secret": inputs.old_secret,
    "old_secret_hash": inputs.old_secret_hash,
    "new_secret": inputs.new_secret,
    "new_secret_hash": inputs.new_secret_hash
  };

  const circuitWasm = "/circuit_wasms_and_keys/ZKPServicesVRF2FAPasswordChange/build/ZKPServicesVRF2FAPasswordChange_js/ZKPServicesVRF2FAPasswordChange.wasm";
  const circuitZkey = "/circuit_wasms_and_keys/ZKPServicesVRF2FAPasswordChange/circuit.zkey";

  let vKey;
  const response = await fetch('/circuit_wasms_and_keys/ZKPServicesVRF2FAPasswordChange/verification_key.json');
  if (response.ok) {
      vKey = await response.json();
      console.log("vKey:", vKey);
  } else {
      console.error('Failed to fetch verification key.');
  }

  try {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, circuitWasm, circuitZkey);
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (isValid) {
      const _pA = [proof.pi_a[0], proof.pi_a[1]];
      const _pB = [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]]
      ];
      const _pC = [proof.pi_c[0], proof.pi_c[1]];
      const _pubSignals = publicSignals;

      const res = {
        result: "Verification OK",
        proof: {
          pi_a: _pA,
          pi_b: _pB,
          pi_c: _pC,
          pubSignals: _pubSignals
        }
      };
      console.log(res);
      return res;
    } else {
      return { result: "Invalid proof" };
    }
  } catch (error) {
    console.error(error);
    return { result: "Error occurred: " + error.toString() };
  }
}

export function generateRandomAsciiString24() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
  let result = '';

  for (let i = 0; i < 24; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

export function generateRandomAsciiString48() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
  let result = '';

  for (let i = 0; i < 48; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

export function splitTo24(str="") {
  const firstElement = str.substring(0, 24);
  const secondElement = str.length > 24 ? str.substring(24, 48) : '';

  return [firstElement, secondElement];
}

export const removeMetadata = (data) => {
  const { _metadata, ...rest } = data;
  return rest;
};