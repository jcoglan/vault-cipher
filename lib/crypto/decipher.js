'use strict';

const asmCrypto = require('./asmcrypto'),
      Buffer    = require('../buffer/browser_buffer').Buffer;

const Decipher = function(cipherMode, key, iv) {
  this._mode   = cipherMode;
  this._key    = key.toString('binary');
  this._iv     = iv.toString('binary');
  this._chunks = [];
};

Decipher.prototype.update = function(chunk, inputEncoding, outputEncoding) {
  this._chunks.push(Buffer.from(chunk, inputEncoding));
  return outputEncoding ? '' : Buffer.alloc(0);
};

Decipher.prototype.final = function(outputEncoding) {
  let ciphertext = Buffer.concat(this._chunks).toString('binary'),
      message    = asmCrypto.AES_CBC.decrypt(ciphertext, this._key, undefined, this._iv);

  message = Buffer.from(message);
  if (message.length === 0) throw new Error('Decrypt error');

  if (outputEncoding) message = message.toString(outputEncoding);

  return message;
};

module.exports = Decipher;
