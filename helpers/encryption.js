async function generateAESKey() {
  return await window.crypto.subtle.generateKey({
    name: "AES-CBC",
    length: 128
  }, true, ["encrypt", "decrypt"]);
}

async function encryptDataAES(plainText, aesKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const ciphertext = await window.crypto.subtle.encrypt({ name: "AES-CBC", iv: iv }, aesKey, data);
  return { ciphertext, iv };
}

async function decryptDataAES(ciphertext, aesKey, iv) {
  const plaintext = await window.crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, aesKey, ciphertext);
  const decoder = new TextDecoder();
  return decoder.decode(plaintext);
}

async function generateRSAKeyPair() {
  return await window.crypto.subtle.generateKey({
    name: "RSA-OAEP",
    modulusLength: 512,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256"
  }, true, ["encrypt", "decrypt"]);
}

async function encryptAESKeyWithRSA(aesKey, publicKey) {
  const exportedAESKey = await window.crypto.subtle.exportKey("raw", aesKey);
  const encryptedAESKey = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, exportedAESKey);
  return encryptedAESKey;
}

async function decryptAESKeyWithRSA(encryptedAESKey, privateKey) {
  const decryptedAESKeyBuffer = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedAESKey);
  return await window.crypto.subtle.importKey("raw", decryptedAESKeyBuffer, { name: "AES-CBC", length: 128 }, true, ["encrypt", "decrypt"]);
}

