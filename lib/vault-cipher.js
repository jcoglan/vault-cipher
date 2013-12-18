(function(factory) {
  if (typeof module === 'object' && typeof require === 'function')
    module.exports = factory(require('crypto'));
  else if (typeof window !== 'undefined')
    window.Cipher = factory(crypto_shim);

})(function(crypto) {
'use strict';

var pbkdf2 = function(password, salt, keylen, iterations, callback, context) {
  crypto.pbkdf2(password, salt, iterations, keylen, function(error, key) {
    if (typeof key === 'string') key = new Buffer(key, 'binary');
    callback.call(context, error, key);
  });
};

var Cipher = function(key, options) {
  options = options || {};

  this._key     = key;
  this._work    = options.work || Cipher.DEFAULT_WORK;
  this._mode    = Cipher.DEFAULT_MODE;
  this._mac     = Cipher.DEFAULT_MAC;
  this._format  = options.format || Cipher.DEFAULT_FORMAT;
  this._salt    = options.salt || Cipher.UUID;
  this._keySize = Cipher.KEY_SIZE;
  this._ivSize  = Cipher.BLOCK_SIZE;
  this._macSize = Cipher.MAC_SIZE;
};

Cipher.DEFAULT_WORK   = 1000;
Cipher.DEFAULT_MODE   = 'aes-256-cbc';
Cipher.DEFAULT_MAC    = 'sha256';
Cipher.DEFAULT_FORMAT = 'base64';
Cipher.UUID           = '73e69e8a-cb05-4b50-9f42-59d76a511299';
Cipher.KEY_SIZE       = 32;
Cipher.BLOCK_SIZE     = 16;
Cipher.MAC_SIZE       = 32;

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
        cipher     = crypto.createCipheriv(this._mode, encryptKey.toString('binary'), iv.toString('binary')),
        ciphertext = cipher.update(plaintext, 'utf8', 'hex') + cipher.final('hex');

    ciphertext = new Buffer(ciphertext, 'hex');

    var result = new Buffer(iv.length + ciphertext.length);
    iv.copy(result);
    ciphertext.copy(result, iv.length);

    var hmac = crypto.createHmac(this._mac, signKey.toString('binary'));
    hmac.update(result.toString('hex'));

    var mac = new Buffer(hmac.digest('hex'), 'hex'),
        out = new Buffer(result.length + mac.length);

    result.copy(out);
    mac.copy(out, result.length);

    callback.call(context, null, out.toString(this._format));
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
          cipher    = crypto.createDecipheriv(this._mode, encryptKey.toString('binary'), iv.toString('binary')),
          plaintext = cipher.update(payload, 'binary', 'utf8') + cipher.final('utf8');
    }
    catch (e) {
      return callback.call(context, e);
    }

    var hmac = crypto.createHmac(this._mac, signKey.toString('binary'));
    hmac.update(message.toString('hex'));

    var expected = hmac.digest('hex'),
        actual   = mac.toString('hex');

    pbkdf2(this._salt, expected, 32, 1, function(error, key1) {
      pbkdf2(this._salt, actual, 32, 1, function(error, key2) {
        if (key1.toString('hex') !== key2.toString('hex'))
          callback.call(context, new Error('DecryptError'));
        else if (plaintext === null)
          callback.call(context, new Error('DecryptError'));
        else
          callback.call(context, null, plaintext);
      }, this);
    }, this);
  }, this);
};

return Cipher;
});

