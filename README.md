# vault-cipher [![Build Status](https://travis-ci.org/jcoglan/vault-cipher.svg)](https://travis-ci.org/jcoglan/vault-cipher)

Provides a high-level authenticated encryption API that
[Vault](https://github.com/jcoglan/vault) uses to encrypt its stored settings.
On Node, it's backed by the [crypto](https://nodejs.org/api/crypto.html) module,
while in the browser it uses
[crypto-js](https://www.npmjs.com/package/crypto-js). Random values are
generated with `crypto.randomBytes()` or `crypto.getRandomValues()` where
available.

The encryption algorithm is an encrypt-then-MAC scheme based on AES and HMAC.

* The given secret is used to derive an encryption key and a signing key using
  PBKDF2
* The plaintext is padded to a multiple of the AES block size using PKCS#7
* A random `iv` is selected using `crypto.randomBytes()`
* The plaintext is encrypted using AES-256-CBC with the encryption key and `iv`
  to produce `ciphertext`
* `iv` and `ciphertext` are concatenated and signed using HMAC-SHA-256 with the
  signing key to produce `mac`
* The result is the concatenation of `iv`, `ciphertext` and `mac`

```
+--------+      +--------+      +----------------+----------------+
| secret |----->| PBKDF2 |----->| encryption key |  signing key   |
+--------+      +--------+      +----------------+----------------+
                                    |                     |
+---------+                         V                     |
| message |------------------>+-------------+             |
+---------+     +----+        | AES-256-CBC |             |
                | iv |------->+-------------+             |
                +----+              |                     |
                   |                |                     |
                   V                V                     V
              +----------+------------------+     +--------------+
              |    iv    |    ciphertext    |---->| HMAC-SHA-256 |
              +----------+------------------+     +--------------+
                      |               |                 |
                      V               V                 V
                  +----------+------------------+-----------+
                  |    iv    |    ciphertext    |    mac    |
                  +----------+------------------+-----------+
```

Its high-level API provides a simple way to encrypt and decrypt text:

```js
var Cipher = require('vault-cipher'),
    cipher = new Cipher('your secret key');

var ciphertext = cipher.encrypt('some text');

cipher.decrypt(ciphertext) // -> 'some text'
```


### Settings

The cipher is configurable by passing options to the constructor, for example:

```js
var cipher = new Cipher('secret key', {format: 'hex', work: 1000})
```

The available options are:

* `format`: the output format of the ciphertext, either `base64` (default) or
  `hex`
* `salt`: a salt string used during PBKDF2 key derivation, defaults to a GUID
  embedded in the library
* `work`: the number of PBKDF2 iterations used to derive the encryption and
  signing keys, default is `10,000`
