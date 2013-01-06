var fs      = require('fs'),
    Cipher  = require('../lib/vault-cipher'),
    key     = process.argv[2],
    format  = process.argv[3],
    message = process.argv[4];

var cipher = new Cipher(key, {format: format});

cipher.encrypt(message, function(error, text) {
  fs.writeFile(__dirname + '/ciphertext', text);
});

