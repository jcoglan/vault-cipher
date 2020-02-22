'use strict';

const asmCrypto = require('./asmcrypto'),
      Buffer    = require('../buffer/browser_buffer').Buffer;

const MODES = {
  sha1:   'HMAC_SHA1',
  sha256: 'HMAC_SHA256'
};

const Hmac = function(hashMode, key) {
  this._mode   = hashMode;
  this._key    = key.toString('binary');
  this._chunks = [];
};

Hmac.prototype.update = function(chunk, inputEncoding) {
  this._chunks.push(Buffer.from(chunk, inputEncoding));
  return this;
};

Hmac.prototype.digest = function(outputEncoding) {
  let message = Buffer.concat(this._chunks).toString('binary'),
      digest  = asmCrypto[MODES[this._mode]].bytes(message, this._key);

  digest = Buffer.from(digest);
  if (outputEncoding) digest = digest.toString(outputEncoding);

  return digest;
};

module.exports = Hmac;
