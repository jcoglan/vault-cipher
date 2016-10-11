'use strict';

global.crypto   = require('crypto');
global.CryptoJS = require('crypto-js');
global.forge    = require('node-forge');

var f = require('../wrappers/aes_256_cbc');

var key = crypto.randomBytes(32),
    iv  = crypto.randomBytes(16),
    msg = new Buffer('I was there! When Captain Beefheart started up his first band \ud83d\ude31', 'utf8');

console.log('[cjs  ]', f.cjs_aes_256_cbc(key, iv, msg));
console.log('[forge]', f.forge_aes_256_cbc(key, iv, msg));
console.log('[node ]', f.node_aes_256_cbc(key, iv, msg));

console.log('[cjs  ]', f.cjs_decrypt_aes_256_cbc(key, iv, f.cjs_aes_256_cbc(key, iv, msg)));
console.log('[forge]', f.forge_decrypt_aes_256_cbc(key, iv, f.forge_aes_256_cbc(key, iv, msg)));
console.log('[node ]', f.node_decrypt_aes_256_cbc(key, iv, f.node_aes_256_cbc(key, iv, msg)));
