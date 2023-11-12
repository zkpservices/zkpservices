function stringToBigInt(str) {
    if (str.length > 30) {
      throw new Error("String length must be 30 characters or less.");
    }
    let numStr = '';
    for (let i = 0; i < str.length; i++) {
      let ascii = str.charCodeAt(i);
      numStr += ascii.toString().padStart(3, '0');
    }
    return BigInt(numStr);
}
  
function bigIntToString(bigInt) {
    let str = bigInt.toString();
    let result = '';
    for (let i = 0; i < str.length; i += 3) {
        let ascii = parseInt(str.substr(i, 3), 10);
        result += String.fromCharCode(ascii);
    }
    return result;
}
