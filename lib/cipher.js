'use strict';

var Buffer = require('./buffer').Buffer,
    crypto = require('./crypto');

var fetch = function(object, field, dflt) {
  var value = object[field];
  return value === undefined ? dflt : value;
};

var Cipher = function(secret, options) {
  options = options || {};

  if (secret instanceof Array)
    this._keyPair = secret;
  else
    this._secret = secret;

  this._input  = fetch(options, 'input',  Cipher.DEFAULT_INPUT);
  this._format = fetch(options, 'format', Cipher.DEFAULT_FORMAT);
  this._salt   = fetch(options, 'salt',   Cipher.UUID);
  this._work   = fetch(options, 'work',   Cipher.DEFAULT_WORK);

  this._mode         = Cipher.DEFAULT_MODE;
  this._mac          = Cipher.DEFAULT_MAC;
  this._pbkdf2Digest = Cipher.PBKDF2_DIGEST;
  this._keySize      = Cipher.KEY_SIZE;
  this._ivSize       = Cipher.BLOCK_SIZE;
  this._macSize      = Cipher.MAC_SIZE;
};

Cipher.DEFAULT_WORK   = 1000;
Cipher.DEFAULT_MODE   = 'aes-256-cbc';
Cipher.PBKDF2_DIGEST  = 'sha1';
Cipher.DEFAULT_MAC    = 'sha256';
Cipher.DEFAULT_FORMAT = 'base64';
Cipher.DEFAULT_INPUT  = 'utf8';
Cipher.UUID           = '73e69e8a-cb05-4b50-9f42-59d76a511299';
Cipher.KEY_SIZE       = 32;
Cipher.BLOCK_SIZE     = 16;
Cipher.MAC_SIZE       = 32;

Cipher.randomKeys = function() {
  var buffer     = crypto.randomBytes(2 * Cipher.KEY_SIZE),
      encryptKey = buffer.slice(0, Cipher.KEY_SIZE),
      signKey    = buffer.slice(Cipher.KEY_SIZE, buffer.length);

  return [encryptKey, signKey];
};

Cipher.prototype.deriveKeys = function() {
  if (this._keyPair) return this._keyPair;

  var key = crypto.pbkdf2Sync(this._secret, this._salt, this._work, 2 * this._keySize, this._pbkdf2Digest);

  var encryptKey = key.slice(0, this._keySize),
      signKey    = key.slice(this._keySize, key.length);

  return this._keyPair = [encryptKey, signKey];
};

Cipher.prototype.encrypt = function(plaintext, callback, context) {
  var keyPair    = this.deriveKeys(),
      encryptKey = keyPair[0],
      signKey    = keyPair[1],
      iv         = crypto.randomBytes(this._ivSize),
      cipher     = crypto.createCipheriv(this._mode, encryptKey, iv),
      ciphertext = cipher.update(plaintext, this._input, 'binary') + cipher.final('binary');

  ciphertext = new Buffer(ciphertext, 'binary');
  ciphertext = Buffer.concat([iv, ciphertext], iv.length + ciphertext.length);

  var hmac = crypto.createHmac(this._mac, signKey);
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
      message    = buffer.slice(0, Math.max(buffer.length - this._macSize, 0)),
      iv         = message.slice(0, Math.min(this._ivSize, message.length)),
      payload    = message.slice(Math.min(this._ivSize, message.length)),
      mac        = buffer.slice(Math.max(buffer.length - this._macSize, 0)),
      cipher     = crypto.createDecipheriv(this._mode, encryptKey, iv),
      plaintext  = cipher.update(payload, 'binary', this._input) + cipher.final(this._input);

  var hmac = crypto.createHmac(this._mac, signKey);
  hmac = hmac.update(message).digest();

  var expected = crypto.createHmac(this._mac, this._salt).update(hmac).digest('hex'),
      actual   = crypto.createHmac(this._mac, this._salt).update(mac).digest('hex');

  if (expected !== actual || plaintext === null)
    throw new Error('DecryptError');
  else
    return plaintext;
};

module.exports = Cipher;
