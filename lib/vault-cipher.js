'use strict';

var Buffer = require('./buffer').Buffer,
    crypto = require('./crypto');

var pbkdf2 = function(password, salt, keylen, iterations, callback, context) {
  crypto.pbkdf2(password, salt, iterations, keylen, function(error, key) {
    if (typeof key === 'string') key = new Buffer(key, 'binary');
    callback.call(context, error, key);
  });
};

var fetch = function(object, key, dflt) {
  var value = object[key];
  return value === undefined ? dflt : value;
};

var Cipher = function(key, options) {
  options = options || {};

  if (key instanceof Array)
    this._keyPair = key;
  else
    this._key = key;

  this._input  = fetch(options, 'input',  Cipher.DEFAULT_INPUT);
  this._format = fetch(options, 'format', Cipher.DEFAULT_FORMAT);
  this._salt   = fetch(options, 'salt',   Cipher.UUID);
  this._work   = fetch(options, 'work',   Cipher.DEFAULT_WORK);

  this._mode    = Cipher.DEFAULT_MODE;
  this._mac     = Cipher.DEFAULT_MAC;
  this._keySize = Cipher.KEY_SIZE;
  this._ivSize  = Cipher.BLOCK_SIZE;
  this._macSize = Cipher.MAC_SIZE;
};

Cipher.DEFAULT_WORK   = 1000;
Cipher.DEFAULT_MODE   = 'aes-256-cbc';
Cipher.DEFAULT_MAC    = 'sha256';
Cipher.DEFAULT_FORMAT = 'base64';
Cipher.DEFAULT_INPUT  = 'utf8';
Cipher.UUID           = '73e69e8a-cb05-4b50-9f42-59d76a511299';
Cipher.KEY_SIZE       = 32;
Cipher.BLOCK_SIZE     = 16;
Cipher.MAC_SIZE       = 32;

Cipher.concatBuffer = function(list, length) {
  return Buffer.concat(list, length);
};

Cipher.randomKeys = function() {
  var buffer     = crypto.randomBytes(2 * Cipher.KEY_SIZE),
      encryptKey = buffer.slice(0, Cipher.KEY_SIZE),
      signKey    = buffer.slice(Cipher.KEY_SIZE, buffer.length);

  return [encryptKey, signKey];
};

Cipher.prototype.deriveKeys = function(callback, context) {
  if (this._keyPair) return callback.apply(context, this._keyPair);
  var self = this;

  pbkdf2(this._key, this._salt, 2 * this._keySize, this._work, function(error, key) {
    var encryptKey = key.slice(0, self._keySize),
        signKey    = key.slice(self._keySize, key.length);

    self._keyPair = [encryptKey, signKey];
    callback.call(context, encryptKey, signKey);
  }, this);
};

Cipher.prototype.encrypt = function(plaintext, callback, context) {
  this.deriveKeys(function(encryptKey, signKey) {
    var iv         = crypto.randomBytes(this._ivSize),
        cipher     = crypto.createCipheriv(this._mode, encryptKey, iv),
        ciphertext = cipher.update(plaintext, this._input, 'binary') + cipher.final('binary');

    ciphertext = new Buffer(ciphertext, 'binary');
    ciphertext = Buffer.concat([iv, ciphertext], iv.length + ciphertext.length);

    var hmac = crypto.createHmac(this._mac, signKey);
    hmac = new Buffer(hmac.update(ciphertext).digest('binary'), 'binary');

    var out = Buffer.concat([ciphertext, hmac], ciphertext.length + hmac.length);
    if (this._format) out = out.toString(this._format);

    callback.call(context, null, out);
  }, this);
};

Cipher.prototype.decrypt = function(ciphertext, callback, context) {
  this.deriveKeys(function(encryptKey, signKey) {
    try {
      var buffer    = new Buffer(ciphertext, this._format),
          message   = buffer.slice(0, Math.max(buffer.length - this._macSize, 0)),
          iv        = message.slice(0, Math.min(this._ivSize, message.length)),
          payload   = message.slice(Math.min(this._ivSize, message.length)),
          mac       = buffer.slice(Math.max(buffer.length - this._macSize, 0)),
          cipher    = crypto.createDecipheriv(this._mode, encryptKey, iv),
          plaintext = cipher.update(payload, 'binary', this._input) + cipher.final(this._input);
    }
    catch (error) {
      return callback.call(context, error);
    }

    var hmac = crypto.createHmac(this._mac, signKey);
    hmac = new Buffer(hmac.update(message).digest('binary'), 'binary');

    var expected = crypto.createHmac(this._mac, this._salt).update(hmac).digest('hex'),
        actual   = crypto.createHmac(this._mac, this._salt).update(mac).digest('hex');

    if (expected !== actual)
      callback.call(context, new Error('DecryptError'));
    else if (plaintext === null)
      callback.call(context, new Error('DecryptError'));
    else
      callback.call(context, null, plaintext);
  }, this);
};

var c = new Cipher(Cipher.randomKeys(), {format: 'binary', input: 'binary'});
c.encrypt(new Buffer(2 * Cipher.KEY_SIZE), function(e, ciphertext) {
  Cipher.ENCRYPTED_KEYPAIR_SIZE = ciphertext.length;
});

module.exports = Cipher;
