'use strict';

const asmCrypto = require('./asmcrypto'),
      Buffer    = require('../buffer/browser_buffer').Buffer;

class Decipher {
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
    let ciphertext = Buffer.concat(this._chunks)._bytes,
        message    = asmCrypto.AES_CBC.decrypt(ciphertext, this._key, undefined, this._iv);

    message = Buffer.from(message);
    if (message.length === 0) throw new Error('Decrypt error');

    if (outputEncoding) message = message.toString(outputEncoding);

    return message;
  }
}

module.exports = Decipher;
