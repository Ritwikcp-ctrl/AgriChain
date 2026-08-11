# Implementing some encryption and decryption .

```js
function xor_Encrypt(inputString,key) {
          let encrypted_Hex = "";

          for (let i = 0; i< inputString.length; i++){
            const plaing_String = inputString.charCodeAt(i);
            const key_char = key.charCodeAt(i % key.length);

            const xor_Result = plain_string ^ key_char;

            let hex = xor_Result.toString(16);
            if(hex.length < 2){
                hex = "0"+ hex;
            }

            encrypted_Hex += hex;
        
        }
        return encrypted_Hex;
}

```

## steps to decrypt the encypted_Hex :-
### Convert hexInput string into an array and for this first, iterate through the hex string two characters at a time then take two character hex substring , convert hex substring to an integer,xor each byte with key and convert back to character , perform xor operation convert the xor resuylt back to a character 

```js
function xorDecrypt(hexInput,key) {
    let decrypted_String = "";
    const bytes = [];

    for (let i = 0; i<hexInput.length; i+=2){
        const hexa_Byte = hexInput.slice(i,i+2);
        bytes.push(parseInt(hexa_Bute,16));
    }

    for (let i = 0; i<bytes.length; i++) {
        const byte_Value = bytes[i];
        const key_Char = key.charCodeAt(i%key.length);
        
        const xor_Result = byte_Value ^ key_Char;
        
        decrypted_String = String.fromCharCode(xor_Result);
    }

    return decrypted_String;
}