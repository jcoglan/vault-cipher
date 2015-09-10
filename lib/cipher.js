'use strict';

var Buffer  = require('./buffer').Buffer,
    crypto  = require('./crypto'),
    Promise = require('./promise');

var pbkdf2 = function(password, salt, keylen, iterations, callback, context) {
  crypto.pbkdf2(password, salt, iterations, keylen, function(error, key) {
    if (typeof key === 'string') key = new Buffer(key, 'binary');
    callback.call(context, error, key);
  });
};

var fetch = function(object, field, dflt) {
  var value = object[field];
  return value === undefined ? dflt : value;
};

var Cipher = function(secret, options) {
  options = options || {};

  if (secret instanceof Array)
    this._keyPair = Promise.resolved(secret);
  else
    this._secret = secret;

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
  var self = this;

  this._keyPair = this._keyPair || new Promise(function(resolve, reject) {
    pbkdf2(self._secret, self._salt, 2 * self._keySize, self._work, function(error, key) {
      if (error) return reject(error);

      var encryptKey = key.slice(0, self._keySize),
          signKey    = key.slice(self._keySize, key.length);

      resolve([encryptKey, signKey]);
    });
  });

  if (callback)
    this._keyPair.then(function(keyPair) { callback.apply(context, keyPair) });

  return this._keyPair;
};

Cipher.prototype.encrypt = function(plaintext, callback, context) {
  var self = this;

  var result = self.deriveKeys().then(function(keyPair) {
    var encryptKey = keyPair[0],
        signKey    = keyPair[1],
         iv        = crypto.randomBytes(self._ivSize),
        cipher     = crypto.createCipheriv(self._mode, encryptKey, iv),
        ciphertext = cipher.update(plaintext, self._input, 'binary') + cipher.final('binary');

    ciphertext = new Buffer(ciphertext, 'binary');
    ciphertext = Buffer.concat([iv, ciphertext], iv.length + ciphertext.length);

    var hmac = crypto.createHmac(self._mac, signKey);
    hmac = new Buffer(hmac.update(ciphertext).digest('binary'), 'binary');

    var out = Buffer.concat([ciphertext, hmac], ciphertext.length + hmac.length);
    if (self._format) out = out.toString(self._format);

    return out;
  });

  if (callback)
    result.then(function(out) { callback.call(context, null, out) },
                function(error) { callback.call(context, error) });

  return result;
};

Cipher.prototype.decrypt = function(ciphertext, callback, context) {
  var self = this;

  var result = this.deriveKeys().then(function(keyPair) {
    var encryptKey = keyPair[0],
        signKey    = keyPair[1],
        buffer     = new Buffer(ciphertext, self._format),
        message    = buffer.slice(0, Math.max(buffer.length - self._macSize, 0)),
        iv         = message.slice(0, Math.min(self._ivSize, message.length)),
        payload    = message.slice(Math.min(self._ivSize, message.length)),
        mac        = buffer.slice(Math.max(buffer.length - self._macSize, 0)),
        cipher     = crypto.createDecipheriv(self._mode, encryptKey, iv),
        plaintext  = cipher.update(payload, 'binary', self._input) + cipher.final(self._input);

    var hmac = crypto.createHmac(self._mac, signKey);
    hmac = new Buffer(hmac.update(message).digest('binary'), 'binary');

    var expected = crypto.createHmac(self._mac, self._salt).update(hmac).digest('hex'),
        actual   = crypto.createHmac(self._mac, self._salt).update(mac).digest('hex');

    if (expected !== actual || plaintext === null)
      throw new Error('DecryptError');
    else
      return plaintext;
  });

  if (callback)
    result.then(function(plaintext) { callback.call(context, null, plaintext) },
                function(error) { callback.call(context, error) });

  return result;
};

var c = new Cipher(Cipher.randomKeys(), {format: 'binary', input: 'binary'}),
    e = c.encrypt(new Buffer(2 * Cipher.KEY_SIZE));

e.then(function(ciphertext) {
  Cipher.ENCRYPTED_KEYPAIR_SIZE = ciphertext.length;
});

module.exports = Cipher;
