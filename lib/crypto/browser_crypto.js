'use strict';

var asmCrypto = require('./asmcrypto'),
    Buffer    = require('../buffer/browser_buffer').Buffer,
    Cipher    = require('./cipher'),
    Decipher  = require('./decipher'),
    Hmac      = require('./hmac');

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
    password = new Buffer(password).toString('binary');
    salt     = new Buffer(salt).toString('binary');

    var pbkdf2 = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, salt, work, keyBytes);

    return new Buffer(pbkdf2);
  }
};

if (Uint8Array && browserCrypto && browserCrypto.getRandomValues) {
  shim.randomBytes = function(n) {
    return new Buffer(browserCrypto.getRandomValues(new Uint8Array(n)));
  };
} else {
  shim.randomBytes = function(n) {
    var array = [];
    while (n--) array.push(Math.floor(Math.random() * 256));
    return new Buffer(array);
  };
}

module.exports = shim;
