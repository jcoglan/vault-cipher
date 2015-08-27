'use strict';

var Buffer     = require('../buffer').Buffer,
    Hex        = require('crypto-js/core').enc.Hex,
    HmacSHA256 = require('crypto-js/hmac-sha256');

var Hmac = function(hashMode, key) {
  this._mode = hashMode;
  this._key  = Hex.parse(key.toString('hex'));
  this._text = new Buffer([]);
};

Hmac.prototype.update = function(chunk, inputEncoding) {
  chunk = new Buffer(chunk, inputEncoding);
  this._text = Buffer.concat([this._text, chunk]);
  return this;
};

Hmac.prototype.digest = function(outputEncoding) {
  var message = Hex.parse(this._text.toString('hex')),
      digest  = HmacSHA256(message, this._key);

  digest = digest.toString(Hex);
  return new Buffer(digest, 'hex').toString(outputEncoding);
};

module.exports = Hmac;
