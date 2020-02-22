'use strict';

const AES_CBC = require('./asmcrypto.all').AES_CBC,
      Buffer  = require('../buffer/browser_buffer').Buffer;

class Cipher {
  constructor(cipherMode, key, iv) {
    this._mode   = cipherMode;
    this._key    = key._bytes;
    this._iv     = iv._bytes;
    this._chunks = [];
  }

  update(chunk, inputEncoding, outputEncoding) {
    this._chunks.push(Buffer.from(chunk, inputEncoding));
    return outputEncoding ? '' : Buffer.alloc(0);
  }

  final(outputEncoding) {
    let message    = Buffer.concat(this._chunks)._bytes,
        ciphertext = AES_CBC.encrypt(message, this._key, undefined, this._iv);

    ciphertext = Buffer.from(ciphertext);
    if (outputEncoding) ciphertext = ciphertext.toString(outputEncoding);

    return ciphertext;
  }
}

module.exports = Cipher;
