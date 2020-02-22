'use strict';

const asmCrypto = require('./asmcrypto.all'),
      Buffer    = require('../buffer/browser_buffer').Buffer;

const MODES = {
  sha1:   asmCrypto.HmacSha1,
  sha256: asmCrypto.HmacSha256
};

class Hmac {
  constructor(hashMode, key) {
    this._mode   = MODES[hashMode];
    this._key    = key;
    this._chunks = [];
  }

  update(chunk, inputEncoding) {
    this._chunks.push(Buffer.from(chunk, inputEncoding));
    return this;
  }

  digest(outputEncoding) {
    let hmac    = new this._mode(this._key._bytes),
        message = Buffer.concat(this._chunks),
        digest  = hmac.process(message._bytes).finish().result;

    digest = Buffer.from(digest);
    if (outputEncoding) digest = digest.toString(outputEncoding);

    return digest;
  }
};

module.exports = Hmac;
