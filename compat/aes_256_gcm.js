'use strict';

global.crypto = require('crypto'),
global.forge  = require('node-forge');
global.sjcl   = require('sjcl');

var f = require('./wrappers/aes_256_gcm');

var key = crypto.randomBytes(32),
    iv  = crypto.randomBytes(12),
    msg = new Buffer('I was there! When Captain Beefheart started up his first band \ud83d\ude31', 'utf8');

console.log('[forge]', f.forge_aes_256_gcm(key, iv, msg));
console.log('[node ]', f.node_aes_256_gcm(key, iv, msg));
console.log('[sjcl ]', f.sjcl_aes_256_gcm(key, iv, msg));

console.log('[forge]', f.forge_decrypt_aes_256_gcm(key, iv, f.forge_aes_256_gcm(key, iv, msg)));
console.log('[node ]', f.node_decrypt_aes_256_gcm(key, iv, f.node_aes_256_gcm(key, iv, msg)));
console.log('[sjcl ]', f.sjcl_decrypt_aes_256_gcm(key, iv, f.sjcl_aes_256_gcm(key, iv, msg)));
