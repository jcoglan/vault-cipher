'use strict';

var asmCrypto = require('./asmcrypto'),
    Buffer    = require('../buffer/browser_buffer').Buffer;

var Decipher = function(cipherMode, key, iv) {
  this._mode   = cipherMode;
  this._key    = key.toString('binary');
  this._iv     = iv.toString('binary');
  this._chunks = [];
};

Decipher.prototype.update = function(chunk, inputEncoding, outputEncoding) {
  this._chunks.push(new Buffer(chunk, inputEncoding));
  return outputEncoding ? '' : new Buffer(0);
};

Decipher.prototype.final = function(outputEncoding) {
  var ciphertext = Buffer.concat(this._chunks).toString('binary'),
      message    = asmCrypto.AES_CBC.decrypt(ciphertext, this._key, undefined, this._iv);

  message = new Buffer(message);
  if (message.length === 0) throw new Error('Decrypt error');

  if (outputEncoding) message = message.toString(outputEncoding);

  return message;
};

module.exports = Decipher;
