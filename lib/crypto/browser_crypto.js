'use strict';

var Buffer   = require('../buffer/browser_buffer').Buffer,
    Hex      = require('crypto-js/enc-hex'),
    PBKDF2   = require('crypto-js/pbkdf2'),
    Cipher   = require('./cipher'),
    Decipher = require('./decipher'),
    Hmac     = require('./hmac');

var browserCrypto = global.crypto,
    Uint8Array    = global.Uint8Array;

var shim = {
  createCipheriv: function(cipherMode, key, iv) {
    return new Cipher(cipherMode, key, iv);
  },

  createDecipheriv: function(cipherMode, key, iv) {
    return new Decipher(cipherMode, key, iv);
  },

  createHmac: function(hashMode, key) {
    return new Hmac(hashMode, key);
  },

  pbkdf2Sync: function(password, salt, work, keyBytes, digest) {
    password = Hex.parse(new Buffer(password).toString('hex'));
    salt     = Hex.parse(new Buffer(salt).toString('hex'));

    var key = PBKDF2(password, salt, {keySize: keyBytes/4, iterations: work});
    return new Buffer(key.toString(Hex), 'hex');
  }
};

if (Uint8Array && browserCrypto && browserCrypto.getRandomValues) {
  shim.randomBytes = function(n) {
    var array = new Uint8Array(n);
    browserCrypto.getRandomValues(array);
    return new Buffer(array);
  };
} else {
  shim.randomBytes = function(n) {
    var array = [];
    while (n--) array.push(Math.floor(Math.random() * 256));
    return new Buffer(array);
  };
}

module.exports = shim;
