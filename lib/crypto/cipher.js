'use strict';

var asmCrypto = require('./asmcrypto'),
    Buffer    = require('../buffer/browser_buffer').Buffer;

var Cipher = function(cipherMode, key, iv) {
  this._mode   = cipherMode;
  this._key    = key.toString('binary');
  this._iv     = iv.toString('binary');
  this._chunks = [];
};

Cipher.prototype.update = function(chunk, inputEncoding, outputEncoding) {
  this._chunks.push(new Buffer(chunk, inputEncoding));
  return outputEncoding ? '' : new Buffer(0);
};

Cipher.prototype.final = function(outputEncoding) {
  var message    = Buffer.concat(this._chunks).toString('binary'),
      ciphertext = asmCrypto.AES_CBC.encrypt(message, this._key, undefined, this._iv);

  ciphertext = new Buffer(ciphertext);
  if (outputEncoding) ciphertext = ciphertext.toString(outputEncoding);

  return ciphertext;
};

module.exports = Cipher;
