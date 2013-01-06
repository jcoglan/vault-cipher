var fs      = require('fs'),
    Cipher  = require('../lib/vault-cipher'),
    key     = process.argv[2],
    message = process.argv[3];

var cipher = new Cipher(key, {uuid: 'x'});

cipher.encrypt(message, function(error, text) {
  fs.writeFile(__dirname + '/ciphertext', text);
});

