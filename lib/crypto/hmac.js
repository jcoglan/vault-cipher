'use strict';

var asmCrypto = require('./asmcrypto'),
    Buffer    = require('../buffer/browser_buffer').Buffer;

var MODES = {
  sha1:   'HMAC_SHA1',
  sha256: 'HMAC_SHA256'
};

var Hmac = function(hashMode, key) {
  this._mode   = hashMode;
  this._key    = key.toString('binary');
  this._chunks = [];
};

Hmac.prototype.update = function(chunk, inputEncoding) {
  this._chunks.push(new Buffer(chunk, inputEncoding));
  return this;
};

Hmac.prototype.digest = function(outputEncoding) {
  var message = Buffer.concat(this._chunks).toString('binary'),
      digest  = asmCrypto[MODES[this._mode]].bytes(message, this._key);

  digest = new Buffer(digest);
  if (outputEncoding) digest = digest.toString(outputEncoding);

  return digest;
};

module.exports = Hmac;
