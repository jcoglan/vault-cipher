# vault-cipher

Provides a high-level authenticated encryption API that
[Vault](http://github.com/jcoglan/vault) uses to encrypt its stored settings.
It is not intended to be a long-term solution since eventually we will be able
to use GCM mode or NaCl in Node, but for now I'm using a hand-rolled
encrypt-then-MAC scheme based on AES-256-CBC and HMAC-SHA-256.

It is very high-level, providing a simple way to encrypt and decrypt text:

```js
var Cipher = require('vault-cipher'),
    cipher = new Cipher('your secret key');

cipher.encrypt('some text', function(error, ciphertext) {

  cipher.decrypt(ciphertext, function(error, message) {

    // message == 'some text'
  });
});
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
