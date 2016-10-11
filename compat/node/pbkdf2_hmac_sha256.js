global.asmCrypto = require('../vendor/asmcrypto');
global.Benchmark = require('benchmark');
global.crypto    = require('crypto');
global.CryptoJS  = require('crypto-js');
global.forge     = require('node-forge');
global.sjcl      = require('sjcl');

require('../wrappers/pbkdf2_hmac_sha256');
