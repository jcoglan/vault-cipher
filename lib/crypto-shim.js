var crypto_shim = {
  createCipheriv: function(cipherMode, key, iv) {
    return new crypto_shim.Cipher(cipherMode, new Buffer(key, 'binary'), new Buffer(iv, 'binary'));
  },

  createDecipheriv: function(cipherMode, key, iv) {
    return new crypto_shim.Decipher(cipherMode, new Buffer(key, 'binary'), new Buffer(iv, 'binary'));
  },

  createHmac: function(hashMode, key) {
    return new crypto_shim.Hmac(hashMode, new Buffer(key, 'binary'));
  },

  pbkdf2: function(password, salt, work, keyBytes, callback) {
    var key    = CryptoJS.PBKDF2(password, salt, {keySize: keyBytes/4, iterations: work}),
        buffer = new Buffer(key.toString(CryptoJS.enc.Hex), 'hex');

    callback(null, buffer);
  }
};

if (typeof Uint8Array !== 'undefined' && typeof crypto !== 'undefined' && crypto.getRandomValues) {
  crypto_shim.randomBytes = function(n) {
    var array = new Uint8Array(n);
    crypto.getRandomValues(array);
    return new Buffer(String.fromCharCode.apply(String, array), 'binary');
  };
} else {
  crypto_shim.randomBytes = function(n) {
    var array = [];
    while (n--) array.push(Math.floor(Math.random() * 256));
    return new Buffer(array);
  };
}

crypto_shim.Cipher = function(cipherMode, key, iv) {
  this._mode = cipherMode;
  this._key  = CryptoJS.enc.Hex.parse(key.toString('hex'));
  this._iv   = CryptoJS.enc.Hex.parse(iv.toString('hex'));
  this._text = new Buffer([]);
};

crypto_shim.Cipher.prototype.update = function(chunk, inputEncoding, outputEncoding) {
  chunk = new Buffer(chunk, inputEncoding);
  this._text = Buffer.concat([this._text, chunk]);
  return '';
};

crypto_shim.Cipher.prototype.final = function(outputEncoding) {
  var message   = CryptoJS.enc.Hex.parse(this._text.toString('hex')),
      encrypted = CryptoJS.AES.encrypt(message, this._key, {iv: this._iv});

  encrypted = encrypted.toString(); // base64
  return new Buffer(encrypted, 'base64').toString(outputEncoding);
};

crypto_shim.Decipher = function(cipherMode, key, iv) {
  this._mode = cipherMode;
  this._key  = CryptoJS.enc.Hex.parse(key.toString('hex'));
  this._iv   = CryptoJS.enc.Hex.parse(iv.toString('hex'));
  this._text = new Buffer([]);
};

crypto_shim.Decipher.prototype.update = function(chunk, inputEncoding, outputEncoding) {
  chunk = new Buffer(chunk, inputEncoding);
  this._text = Buffer.concat([this._text, chunk]);
  return '';
};

crypto_shim.Decipher.prototype.final = function(outputEncoding) {
  var message = this._text.toString('base64'),
      plain   = CryptoJS.AES.decrypt(message, this._key, {iv: this._iv});

  plain = plain.toString(CryptoJS.enc.Hex);
  return new Buffer(plain, 'hex').toString(outputEncoding);
};

crypto_shim.Hmac = function(hashMode, key) {
  this._mode = hashMode;
  this._key  = CryptoJS.enc.Hex.parse(key.toString('hex'));
  this._text = new Buffer([]);
};

crypto_shim.Hmac.prototype.update = function(chunk, inputEncoding) {
  chunk = new Buffer(chunk, inputEncoding);
  this._text = Buffer.concat([this._text, chunk]);
  return this;
};

crypto_shim.Hmac.prototype.digest = function(outputEncoding) {
  var message = CryptoJS.enc.Hex.parse(this._text.toString('hex')),
      digest  = CryptoJS.HmacSHA256(message, this._key);

  digest = digest.toString(CryptoJS.enc.Hex);
  return new Buffer(digest, 'hex').toString(outputEncoding);
};

