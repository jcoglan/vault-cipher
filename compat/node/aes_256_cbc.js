global.asmCrypto = require('../vendor/asmcrypto.all');
global.crypto    = require('crypto');
global.CryptoJS  = require('crypto-js');
global.forge     = require('node-forge');

require('../wrappers/aes_256_cbc');
