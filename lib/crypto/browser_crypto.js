'use strict';

var Buffer   = require('../buffer').Buffer,
    Hex      = require('crypto-js/core').enc.Hex,
    Cipher   = require('./cipher'),
    Decipher = require('./decipher'),
    Hmac     = require('./hmac'),
    PBKDF2   = require('crypto-js/pbkdf2');

var crypto = {
  createCipheriv: function(cipherMode, key, iv) {
    return new Cipher(cipherMode, new Buffer(key, 'binary'), new Buffer(iv, 'binary'));
  },

  createDecipheriv: function(cipherMode, key, iv) {
    return new Decipher(cipherMode, new Buffer(key, 'binary'), new Buffer(iv, 'binary'));
  },

  createHmac: function(hashMode, key) {
    return new Hmac(hashMode, new Buffer(key, 'binary'));
  },

  pbkdf2: function(password, salt, work, keyBytes, callback) {
    var key    = PBKDF2(password, salt, {keySize: keyBytes/4, iterations: work}),
        buffer = new Buffer(key.toString(Hex), 'hex');

    callback(null, buffer);
  }
};

if (typeof Uint8Array !== 'undefined' && typeof crypto !== 'undefined' && crypto.getRandomValues) {
  crypto.randomBytes = function(n) {
    var array = new Uint8Array(n);
    crypto.getRandomValues(array);
    return new Buffer(String.fromCharCode.apply(String, array), 'binary');
  };
} else {
  crypto.randomBytes = function(n) {
    var array = [];
    while (n--) array.push(Math.floor(Math.random() * 256));
    return new Buffer(array);
  };
}

module.exports = crypto;
