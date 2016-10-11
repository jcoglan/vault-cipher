global.asmCrypto = require('../vendor/asmcrypto'),
global.crypto    = require('crypto'),
global.forge     = require('node-forge');
global.sjcl      = require('sjcl');

require('../wrappers/aes_256_gcm');
