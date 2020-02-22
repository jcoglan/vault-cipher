'use strict';

const asmCrypto = require('./asmcrypto'),
      Buffer    = require('../buffer/browser_buffer').Buffer,
      Cipher    = require('./cipher'),
      Decipher  = require('./decipher'),
      Hmac      = require('./hmac');

const browserCrypto = global.crypto,
      Uint8Array    = global.Uint8Array;

const shim = {
  createCipheriv(cipherMode, key, iv) {
    return new Cipher(cipherMode, key, iv);
  },

  createDecipheriv(cipherMode, key, iv) {
    return new Decipher(cipherMode, key, iv);
  },

  createHmac(hashMode, key) {
    return new Hmac(hashMode, key);
  },

  pbkdf2Sync(password, salt, work, keyBytes, digest) {
    password = Buffer.from(password).toString('binary');
    salt     = Buffer.from(salt).toString('binary');

    let pbkdf2 = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, salt, work, keyBytes);

    return Buffer.from(pbkdf2);
  }
};

if (Uint8Array && browserCrypto && browserCrypto.getRandomValues) {
  shim.randomBytes = function(n) {
    return Buffer.from(browserCrypto.getRandomValues(new Uint8Array(n)));
  };
} else {
  shim.randomBytes = function(n) {
    let array = [];
    while (n--) array.push(Math.floor(Math.random() * 256));
    return Buffer.from(array);
  };
}

module.exports = shim;
