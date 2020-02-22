'use strict';

const Buffer = require('./buffer').Buffer,
      crypto = require('./crypto'),
      fetch  = require('./fetch');

const MODES = {
  AES_256_CBC: { name: 'aes-256-cbc', keySize: 32, ivSize: 16 }
};

const MACS = {
  SHA_256: { name: 'sha256', keySize: 32, outputSize: 32 }
};

const DEFAULT_WORK   = 10000,
      PBKDF2_DIGEST  = 'sha1',
      DEFAULT_INPUT  = 'utf8',
      DEFAULT_FORMAT = 'base64',
      UUID           = '73e69e8a-cb05-4b50-9f42-59d76a511299';

class Cipher {
  constructor(secret, options) {
    options = options || {};

    this._input  = fetch(options, 'input',  DEFAULT_INPUT);
    this._format = fetch(options, 'format', DEFAULT_FORMAT);

    this._mode = MODES.AES_256_CBC;
    this._mac  = MACS.SHA_256;

    this._pbkdf2 = {
      hash: PBKDF2_DIGEST,
      salt: fetch(options, 'salt', UUID),
      work: fetch(options, 'work', DEFAULT_WORK)
    };

    if (secret instanceof Buffer)
      this._setKeys(secret);
    else
      this._pbkdf2.secret = secret;
  }

  randomKeys() {
    let keySize = this._mode.keySize + this._mac.keySize,
        keys    = crypto.randomBytes(keySize);

    this._setKeys(keys);
    return keys;
  }

  _deriveKeys() {
    if (this._keys) return this._keys;

    let keySize = this._mode.keySize + this._mac.keySize,
        p       = this._pbkdf2,
        keys    = crypto.pbkdf2Sync(p.secret, p.salt, p.work, keySize, p.hash);

    return this._setKeys(keys);
  }

  _setKeys(buffer) {
    let offset1 =           this._mode.keySize,
        offset2 = offset1 + this._mac.keySize;

    if (buffer.length !== offset2)
      throw new Error('Incorrect key size: expected ' + offset2 + ', got ' + buffer.length);

    return this._keys = [
      buffer.slice(      0, offset1),
      buffer.slice(offset1, offset2)
    ];
  }

  encrypt(plaintext) {
    let keyPair    = this._deriveKeys(),
        encryptKey = keyPair[0],
        signKey    = keyPair[1],
        iv         = crypto.randomBytes(this._mode.ivSize),
        cipher     = crypto.createCipheriv(this._mode.name, encryptKey, iv),
        ciphertext = Buffer.concat([ iv, cipher.update(plaintext, this._input), cipher.final() ]);

    let hmac = crypto.createHmac(this._mac.name, signKey);
    hmac = hmac.update(ciphertext).digest();

    let out = Buffer.concat([ciphertext, hmac], ciphertext.length + hmac.length);
    if (this._format) out = out.toString(this._format);

    return out;
  }

  decrypt(ciphertext) {
    let keyPair    = this._deriveKeys(),
        encryptKey = keyPair[0],
        signKey    = keyPair[1],

        buffer     = Buffer.from(ciphertext, this._format),
        ivOffset   = Math.min(this._mode.ivSize, buffer.length),
        macOffset  = Math.max(buffer.length - this._mac.outputSize, 0),

        message    = buffer.slice(0, macOffset),
        iv         = message.slice(0, ivOffset),
        payload    = message.slice(ivOffset, message.length),
        mac        = buffer.slice(macOffset, buffer.length),

        cipher     = crypto.createDecipheriv(this._mode.name, encryptKey, iv),
        plaintext  = Buffer.concat([ cipher.update(payload), cipher.final() ]);

    let hmac = crypto.createHmac(this._mac.name, signKey);
    hmac = hmac.update(message).digest();

    let expected = crypto.createHmac(this._mac.name, UUID).update(hmac).digest('hex'),
        actual   = crypto.createHmac(this._mac.name, UUID).update(mac).digest('hex');

    if (expected !== actual || plaintext === null)
      throw new Error('DecryptError');

    if (this._input) plaintext = plaintext.toString(this._input);
    return plaintext;
  }
}

module.exports = Cipher;
