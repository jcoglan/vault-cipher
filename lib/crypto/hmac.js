'use strict';

var Buffer = require('../buffer/browser_buffer').Buffer,
    Hex    = require('crypto-js/core').enc.Hex;

var HMAC = {
  sha1:   require('crypto-js/hmac-sha1'),
  sha256: require('crypto-js/hmac-sha256')
};

var Hmac = function(hashMode, key) {
  this._mode   = hashMode;
  this._key    = Hex.parse(key.toString('hex'));
  this._chunks = [];
};

Hmac.prototype.update = function(chunk, inputEncoding) {
  this._chunks.push(new Buffer(chunk, inputEncoding));
  return this;
};

Hmac.prototype.digest = function(outputEncoding) {
  var text    = Buffer.concat(this._chunks),
      message = Hex.parse(text.toString('hex')),
      digest  = HMAC[this._mode](message, this._key),
      buffer  = new Buffer(digest.toString(Hex), 'hex');

  if (outputEncoding) buffer = buffer.toString(outputEncoding);

  return buffer;
};

module.exports = Hmac;
