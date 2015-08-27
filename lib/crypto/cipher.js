'use strict';

var Buffer = require('../buffer').Buffer,
    Hex    = require('crypto-js/core').enc.Hex,
    AES    = require('crypto-js/aes');

var Cipher = function(cipherMode, key, iv) {
  this._mode = cipherMode;
  this._key  = Hex.parse(key.toString('hex'));
  this._iv   = Hex.parse(iv.toString('hex'));
  this._text = new Buffer([]);
};

Cipher.prototype.update = function(chunk, inputEncoding, outputEncoding) {
  chunk = new Buffer(chunk, inputEncoding);
  this._text = Buffer.concat([this._text, chunk]);
  return '';
};

Cipher.prototype.final = function(outputEncoding) {
  var message   = Hex.parse(this._text.toString('hex')),
      encrypted = AES.encrypt(message, this._key, {iv: this._iv});

  encrypted = encrypted.toString(); // base64
  return new Buffer(encrypted, 'base64').toString(outputEncoding);
};

module.exports = Cipher;
