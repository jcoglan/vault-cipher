'use strict';

var Buffer = require('../buffer/browser_buffer').Buffer,
    AES    = require('crypto-js/aes'),
    CBC    = require('crypto-js/core').mode.CBC,
    Hex    = require('crypto-js/enc-hex'),
    PKCS7  = require('crypto-js/pad-pkcs7');

var Decipher = function(cipherMode, key, iv) {
  this._mode   = cipherMode;
  this._key    = Hex.parse(key.toString('hex'));
  this._iv     = Hex.parse(iv.toString('hex'));
  this._chunks = [];
};

Decipher.prototype.update = function(chunk, inputEncoding, outputEncoding) {
  this._chunks.push(new Buffer(chunk, inputEncoding));
  return '';
};

Decipher.prototype.final = function(outputEncoding) {
  var text    = Buffer.concat(this._chunks),
      message = text.toString('base64'),
      plain   = AES.decrypt(message, this._key, {iv: this._iv, mode: CBC, padding: PKCS7});

  plain = plain.toString(Hex);
  return new Buffer(plain, 'hex').toString(outputEncoding);
};

module.exports = Decipher;
