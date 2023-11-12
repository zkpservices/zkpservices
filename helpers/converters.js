function stringToBigInt(str) {
    if (str.length > 63) {
        throw new Error("String length must be 62 characters or less.");
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

function convertStringToBigInt() {
    try {
        let str = document.getElementById('stringInput').value;
        let bigInt = stringToBigInt(str);
        document.getElementById('bigIntOutput').value = bigInt.toString();
    } catch (e) {
        alert(e.message);
    }
}

function convertBigIntToString() {
    try {
        let bigInt = BigInt(document.getElementById('bigIntInput').value);
        let str = bigIntToString(bigInt);
        document.getElementById('stringOutput').value = str;
    } catch (e) {
        alert(e.message);
    }
}