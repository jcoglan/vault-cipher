'use strict';

const asmCrypto = require('./asmcrypto.all'),
      Buffer    = require('../buffer/browser_buffer').Buffer,
      Cipher    = require('./cipher'),
      Decipher  = require('./decipher'),
      Hmac      = require('./hmac');

const Pbkdf2HmacSha1 = asmCrypto.Pbkdf2HmacSha1;

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
    password = Buffer.from(password);
    salt     = Buffer.from(salt);

    let pbkdf2 = Pbkdf2HmacSha1(password._bytes, salt._bytes, work, keyBytes);

    return Buffer.from(pbkdf2);
  }
};

const browserCrypto = global.crypto,
      Uint8Array    = global.Uint8Array;

if (Uint8Array && browserCrypto && browserCrypto.getRandomValues) {
  shim.randomBytes = (n) => {
    return Buffer.from(browserCrypto.getRandomValues(new Uint8Array(n)));
  };
} else {
  shim.randomBytes = (n) => {
    let array = [];
    while (n--) array.push(Math.floor(Math.random() * 256));
    return Buffer.from(array);
  };
}

module.exports = shim;
