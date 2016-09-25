'use strict';

var Buffer = require('../buffer/browser_buffer').Buffer,
    AES    = require('crypto-js/aes'),
    CBC    = require('crypto-js/core').mode.CBC,
    Hex    = require('crypto-js/enc-hex'),
    PKCS7  = require('crypto-js/pad-pkcs7');

var Cipher = function(cipherMode, key, iv) {
  this._mode   = cipherMode;
  this._key    = Hex.parse(key.toString('hex'));
  this._iv     = Hex.parse(iv.toString('hex'));
  this._chunks = [];
};

Cipher.prototype.update = function(chunk, inputEncoding, outputEncoding) {
  this._chunks.push(new Buffer(chunk, inputEncoding));
  return outputEncoding ? '' : new Buffer(0);
};

Cipher.prototype.final = function(outputEncoding) {
  var text      = Buffer.concat(this._chunks),
      message   = Hex.parse(text.toString('hex')),
      encrypted = AES.encrypt(message, this._key, {iv: this._iv, mode: CBC, padding: PKCS7});

  encrypted = new Buffer(encrypted.toString(), 'base64');
  if (outputEncoding) encrypted = encrypted.toString(outputEncoding);

  return encrypted;
};

module.exports = Cipher;
