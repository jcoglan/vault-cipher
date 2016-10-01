'use strict';


// CryptoJS

var B64 = CryptoJS.enc.Base64;

function cjs_pbkdf2_hmac_sha256(pw, salt, work, len) {
  var pbkdf2 = CryptoJS.PBKDF2(
          B64.parse(pw.toString('base64')),
          B64.parse(salt.toString('base64')), {
            iterations: work,
            keySize: len / 4,
            hasher: CryptoJS.algo.SHA256
          });

  return pbkdf2.toString(B64);
}


// Forge

function forge_pbkdf2_hmac_sha256(pw, salt, work, len) {
  var pbkdf2 = forge.pkcs5.pbkdf2(
          forge.util.decode64(pw.toString('base64')),
          forge.util.decode64(salt.toString('base64')),
          work,
          len,
          forge.sha256.create());

  return forge.util.encode64(pbkdf2);
}


// Node.js

function node_pbkdf2_hmac_sha256(pw, salt, work, len) {
  return crypto.pbkdf2Sync(pw, salt, work, len, 'sha256').toString('base64');
}


// SJCL

var base64 = sjcl.codec.base64;

function sjcl_pbkdf2_hmac_sha256(pw, salt, work, len) {
  var pbkdf2 = sjcl.misc.pbkdf2(
          base64.toBits(pw.toString('base64')),
          base64.toBits(salt.toString('base64')),
          work,
          len * 8);

  return base64.fromBits(pbkdf2);
}


if (typeof module === 'object')
  module.exports = {
    cjs_pbkdf2_hmac_sha256:   cjs_pbkdf2_hmac_sha256,
    forge_pbkdf2_hmac_sha256: forge_pbkdf2_hmac_sha256,
    node_pbkdf2_hmac_sha256:  node_pbkdf2_hmac_sha256,
    sjcl_pbkdf2_hmac_sha256:  sjcl_pbkdf2_hmac_sha256
  };
