var rsaKeyPair;
var aesKey;
var iv;
var ciphertext;

async function importRSAPublicKey() {
    let publicKeyString = document.getElementById("importPublicKeyInput").value;
    if(!rsaKeyPair) {
        rsaKeyPair = {};
    }
    rsaKeyPair.publicKey = await importPublicKey(publicKeyString);
}

async function importRSAPrivateKey() {
    let privateKeyString = document.getElementById("importPrivateKeyInput").value;
    if(!rsaKeyPair) {
        rsaKeyPair = {};
    }
    rsaKeyPair.privateKey = await importPrivateKey(privateKeyString);
}

async function importAESKey() {
    let aesKeyString = document.getElementById("importAESKeyInput").value;
    if (aesKeyString === '') {
        aesKey = null;
    } else {
        let aesKeyBuffer = base64ToArrayBuffer(aesKeyString);
        aesKey = await window.crypto.subtle.importKey(
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

async function generateRSAKeys() {
    rsaKeyPair = await window.crypto.subtle.generateKey(
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

    document.getElementById("publicKeyOutput").textContent = publicKeyString;
    document.getElementById("privateKeyOutput").textContent = privateKeyString;
}

async function importPublicKey(publicKeyString) {
    let publicKeyBuffer = base64ToArrayBuffer(publicKeyString);
    return await window.crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["encrypt", "verify"]
    );
}

async function importPrivateKey(privateKeyString) {
    let privateKeyBuffer = base64ToArrayBuffer(privateKeyString);
    return await window.crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["decrypt", "sign"]
    );
}

async function logRSAKeys() {
    let publicKey = await window.crypto.subtle.exportKey("spki", rsaKeyPair.publicKey);
    let privateKey = await window.crypto.subtle.exportKey("pkcs8", rsaKeyPair.privateKey);
    let publicKeyString = arrayBufferToBase64(publicKey);
    let privateKeyString = arrayBufferToBase64(privateKey);
    console.log("Public Key:", publicKeyString);
    console.log("Private Key:", privateKeyString);
}

async function generateAESKey() {
    aesKey = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
    let aesKeyExported = await window.crypto.subtle.exportKey("raw", aesKey);
    let aesKeyString = arrayBufferToBase64(aesKeyExported);
    document.getElementById("aesKeyOutput").textContent = aesKeyString;
    // document.getElementById("importAESKeyInput").value = '';  // clear import field
}

async function encryptAES() {
    iv = window.crypto.getRandomValues(new Uint8Array(12));
    let message = document.getElementById("messageInput").value;
    let encoded = new TextEncoder().encode(message);
    ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        aesKey,
        encoded
    );
    document.getElementById("aesEncryptedOutput").textContent = arrayBufferToBase64(ciphertext);
}

async function decryptAES() {
    let decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        aesKey,
        ciphertext
    );
    let decryptedMessage = new TextDecoder().decode(decrypted);
    document.getElementById("aesDecryptedOutput").textContent = decryptedMessage;
}

async function encryptAESKeyWithRSA() {
    let aesKeyExported = await window.crypto.subtle.exportKey("raw", aesKey);
    ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        rsaKeyPair.publicKey,
        aesKeyExported
    );
    document.getElementById("rsaEncryptedOutput").textContent = arrayBufferToBase64(ciphertext);
}

async function decryptAESKeyWithRSA() {
    let decryptedAESKey = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP"
        },
        rsaKeyPair.privateKey,
        ciphertext
    );
    document.getElementById("rsaDecryptedOutput").textContent = arrayBufferToBase64(decryptedAESKey);
}

function arrayBufferToBase64(buffer) {
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

function base64ToArrayBuffer(base64) {
    let paddingRemoved = base64.replace(/=/g, '');
    let binary_string = window.atob(paddingRemoved);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

var rsaSigningKeyPair;

async function generateRSASigningKeys() {
    rsaSigningKeyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: "SHA-256"
        },
        true,
        ["sign", "verify"]
    );

    let publicKey = await window.crypto.subtle.exportKey("spki", rsaSigningKeyPair.publicKey);
    let privateKey = await window.crypto.subtle.exportKey("pkcs8", rsaSigningKeyPair.privateKey);

    let publicKeyString = arrayBufferToBase64(publicKey);
    let privateKeyString = arrayBufferToBase64(privateKey);

    document.getElementById("signingPublicKeyOutput").textContent = publicKeyString;
    document.getElementById("signingPrivateKeyOutput").textContent = privateKeyString;
}

async function importRSASigningPublicKey() {
    let publicKeyString = document.getElementById("importSigningPublicKeyInput").value;
    let publicKeyBuffer = base64ToArrayBuffer(publicKeyString);

    let importedPublicKey = await window.crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256"
        },
        true,
        ["verify"]
    );

    if (!rsaSigningKeyPair) {
        rsaSigningKeyPair = {};
    }
    rsaSigningKeyPair.publicKey = importedPublicKey;
}

async function importRSASigningPrivateKey() {
    let privateKeyString = document.getElementById("importSigningPrivateKeyInput").value;
    let privateKeyBuffer = base64ToArrayBuffer(privateKeyString);

    let importedPrivateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256"
        },
        true,
        ["sign"]
    );

    if (!rsaSigningKeyPair) {
        rsaSigningKeyPair = {};
    }
    rsaSigningKeyPair.privateKey = importedPrivateKey;
}

async function signMessage() {
    let message = document.getElementById("messageToSignInput").value;
    let encodedMessage = new TextEncoder().encode(message);

    let signature = await window.crypto.subtle.sign(
        {
            name: "RSASSA-PKCS1-v1_5"
        },
        rsaSigningKeyPair.privateKey,
        encodedMessage
    );

    document.getElementById("signedMessageOutput").textContent = arrayBufferToBase64(signature);
}

async function verifySignedMessage() {
    let message = document.getElementById("messageToVerifyInput").value;  // changed this line
    let encodedMessage = new TextEncoder().encode(message);
    
    let signatureBase64 = document.getElementById("signatureToVerifyInput").value; // and this line
    let signature = base64ToArrayBuffer(signatureBase64);

    let isValid = await window.crypto.subtle.verify(
        {
            name: "RSASSA-PKCS1-v1_5"
        },
        rsaSigningKeyPair.publicKey,
        signature,
        encodedMessage
    );

    document.getElementById("verificationResult").textContent = isValid ? "Valid signature!" : "Invalid signature!";
}
