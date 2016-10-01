# Crypto compatibility

The algorithms implemented in vault-cipher are influenced by the availability of
various functions on the platforms we're targeting, which as of October 2016
includes modern browsers and Node 0.10+.

I have tested the following crypto libraries:

* [asmCrypto](https://github.com/vibornoff/asmcrypto.js)
* [CryptoJS](https://code.google.com/archive/p/crypto-js/)
* [Forge](https://github.com/digitalbazaar/forge)
* [SJCL](https://bitwiseshiftleft.github.io/sjcl/doc/)
* [Node.js](https://nodejs.org/api/crypto.html)

Further possible candidate libraries can be found here:

* [List of JS crypto libraries](https://gist.github.com/jo/8619441)


## Algorithm availability

The following table lists crypto operations we'd like to be able to use, and
whether they are implemented in various libraries.

|                    | asmCrypto | CryptoJS | Forge | SJCL | Node 0.10 | Node 0.12 | Node 4 |
| ------------------ | --------- | -------- | ----- | ---- | --------- | --------- | ------ |
| AES-256-CBC        | Y         | Y        | Y     |      | Y         | Y         | Y      |
| AES-256-GCM        |           |          | Y     | Y    |           | Y         | Y      |
| HMAC-SHA1          |           |          |       |      |           |           |        |
| HMAC-SHA256        |           |          |       |      |           |           |        |
| PBKDF2-HMAC-SHA1   | Y         | Y        | Y     |      | Y         | Y         | Y      |
| PBKDF2-HMAC-SHA256 | Y         | Y        | Y     | Y    |           | Y         | Y      |

We would like to eventually AES-GCM, but as it is not available on some
platforms we target, we're sticking with encrypt-then-MAC using AES-CBC and
HMAC.

HMAC-SHA1 is a hard requirement for implementing the TOTP two-factor
authentication function, which is one of the aims of this library.
