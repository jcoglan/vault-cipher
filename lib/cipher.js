'use strict';

var Buffer = require('./buffer').Buffer,
    crypto = require('./crypto'),
    fetch  = require('./fetch');

var MODES = {
  AES_256_CBC: {name: 'aes-256-cbc', keySize: 32, blockSize: 16}
};

var MACS = {
  SHA_256: {name: 'sha256', keySize: 32, outputSize: 32}
};

var DEFAULT_WORK   = 1000,
    PBKDF2_DIGEST  = 'sha1',
    DEFAULT_INPUT  = 'utf8',
    DEFAULT_FORMAT = 'base64',
    UUID           = '73e69e8a-cb05-4b50-9f42-59d76a511299';

var Cipher = function(secret, options) {
  options = options || {};

  if (secret instanceof Array)
    this._keyPair = secret;
  else
    this._secret = secret;

  this._input  = fetch(options, 'input',  DEFAULT_INPUT);
  this._format = fetch(options, 'format', DEFAULT_FORMAT);
  this._salt   = fetch(options, 'salt',   UUID);
  this._work   = fetch(options, 'work',   DEFAULT_WORK);

  this._mode         = MODES.AES_256_CBC;
  this._mac          = MACS.SHA_256;
  this._pbkdf2Digest = PBKDF2_DIGEST;
};

Cipher.randomKeys = function() {
  var offset     = MODES.AES_256_CBC.keySize,
      keySize    = offset + MACS.SHA_256.keySize,
      buffer     = crypto.randomBytes(keySize),
      encryptKey = buffer.slice(0, offset),
      signKey    = buffer.slice(offset, buffer.length);

  return [encryptKey, signKey];
};

Cipher.prototype.deriveKeys = function() {
  if (this._keyPair) return this._keyPair;

  var keySize    = this._mode.keySize + this._mac.keySize,
      key        = crypto.pbkdf2Sync(this._secret, this._salt, this._work, keySize, this._pbkdf2Digest),
      encryptKey = key.slice(0, this._mode.keySize),
      signKey    = key.slice(this._mode.keySize, key.length);

  return this._keyPair = [encryptKey, signKey];
};

Cipher.prototype.encrypt = function(plaintext, callback, context) {
  var keyPair    = this.deriveKeys(),
      encryptKey = keyPair[0],
      signKey    = keyPair[1],
      iv         = crypto.randomBytes(this._mode.blockSize),
      cipher     = crypto.createCipheriv(this._mode.name, encryptKey, iv),
      ciphertext = Buffer.concat([ cipher.update(plaintext, this._input), cipher.final() ]);

  ciphertext = Buffer.concat([iv, ciphertext], iv.length + ciphertext.length);

  var hmac = crypto.createHmac(this._mac.name, signKey);
  hmac = hmac.update(ciphertext).digest();

  var out = Buffer.concat([ciphertext, hmac], ciphertext.length + hmac.length);
  if (this._format) out = out.toString(this._format);

  return out;
};

Cipher.prototype.decrypt = function(ciphertext, callback, context) {
  var keyPair    = this.deriveKeys(),
      encryptKey = keyPair[0],
      signKey    = keyPair[1],

      buffer     = new Buffer(ciphertext, this._format),
      ivOffset   = Math.min(this._mode.blockSize, buffer.length),
      macOffset  = Math.max(buffer.length - this._mac.outputSize, 0),

      message    = buffer.slice(0, macOffset),
      iv         = message.slice(0, ivOffset),
      payload    = message.slice(ivOffset, message.length),
      mac        = buffer.slice(macOffset, buffer.length),

      cipher     = crypto.createDecipheriv(this._mode.name, encryptKey, iv),
      plaintext  = Buffer.concat([ cipher.update(payload), cipher.final() ]);

  var hmac = crypto.createHmac(this._mac.name, signKey);
  hmac = hmac.update(message).digest();

  var expected = crypto.createHmac(this._mac.name, this._salt).update(hmac).digest('hex'),
      actual   = crypto.createHmac(this._mac.name, this._salt).update(mac).digest('hex');

  if (expected !== actual || plaintext === null)
    throw new Error('DecryptError');

  if (this._input) plaintext = plaintext.toString(this._input);
  return plaintext;
};

module.exports = Cipher;
