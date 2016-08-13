'use strict';

var Cipher = require('./cipher');

Cipher.Buffer = require('./buffer').Buffer;
Cipher.crypto = require('./crypto');

module.exports = Cipher;
