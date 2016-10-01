'use strict';

global.crypto   = require('crypto');
global.bench    = require('benchmark');
global.CryptoJS = require('crypto-js');
global.forge    = require('node-forge');
global.sjcl     = require('sjcl');

var f = require('./wrappers/pbkdf2_hmac_sha256');

var pw   = crypto.randomBytes(16),
    salt = crypto.randomBytes(16),
    work = 100,
    len  = 32;

console.log('[cjs  ]', f.cjs_pbkdf2_hmac_sha256(pw, salt, work, len));
console.log('[forge]', f.forge_pbkdf2_hmac_sha256(pw, salt, work, len));
console.log('[node ]', f.node_pbkdf2_hmac_sha256(pw, salt, work, len));
console.log('[sjcl ]', f.sjcl_pbkdf2_hmac_sha256(pw, salt, work, len));

var suite = new bench.Suite();

suite.add('CryptoJS PBKDF2', function() {
  f.cjs_pbkdf2_hmac_sha256(pw, salt, work, len);
});

suite.add('Forge PBKDF2', function() {
  f.forge_pbkdf2_hmac_sha256(pw, salt, work, len);
});

suite.add('Node PBKDF2', function() {
  f.node_pbkdf2_hmac_sha256(pw, salt, work, len);
});

suite.add('SJCL PBKDF2', function() {
  f.sjcl_pbkdf2_hmac_sha256(pw, salt, work, len);
});

suite.on('complete', function() {
  this.forEach(function(result) { console.log(result.toString()) });
});

suite.run();
