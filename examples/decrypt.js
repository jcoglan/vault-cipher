var fs      = require('fs'),
    Cipher  = require('../lib/vault-cipher'),
    key     = process.argv[2],
    format  = process.argv[3];

var cipher = new Cipher(key, {format: format});

fs.readFile(__dirname + '/ciphertext', function(error, text) {
  cipher.decrypt(text.toString(), function(error, message) {
    console.log('ERROR: ' + error);
    console.log('MESSAGE: ' + message);
  });
});

