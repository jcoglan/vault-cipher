# vault-cipher [![Build Status](https://travis-ci.org/jcoglan/vault-cipher.svg)](https://travis-ci.org/jcoglan/vault-cipher)

Provides a high-level authenticated encryption API that
[Vault](https://github.com/jcoglan/vault) uses to encrypt its stored settings.
It is not intended to be a long-term solution since eventually we will be able
to use GCM mode or NaCl in Node, but for now I'm using a hand-rolled scheme
based on the following:

* The given key is used to derive an encryption key and a signing key using
  PBKDF2
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
  signing keys, default is `1000`


## License

(The MIT License)

Copyright (c) 2011-2015 James Coglan

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
