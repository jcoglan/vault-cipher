'use strict';

const asmCrypto = require('./asmcrypto'),
      Buffer    = require('../buffer/browser_buffer').Buffer;

class Cipher {
  constructor(cipherMode, key, iv) {
    this._mode   = cipherMode;
    this._key    = key.toString('binary');
    this._iv     = iv.toString('binary');
    this._chunks = [];
  }

  update(chunk, inputEncoding, outputEncoding) {
    this._chunks.push(Buffer.from(chunk, inputEncoding));
    return outputEncoding ? '' : Buffer.alloc(0);
  }

  final(outputEncoding) {
    let message    = Buffer.concat(this._chunks).toString('binary'),
        ciphertext = asmCrypto.AES_CBC.encrypt(message, this._key, undefined, this._iv);

    ciphertext = Buffer.from(ciphertext);
    if (outputEncoding) ciphertext = ciphertext.toString(outputEncoding);

    return ciphertext;
  }
}

module.exports = Cipher;
