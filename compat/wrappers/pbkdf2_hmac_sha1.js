'use strict';


// asmCrypto

function asm_pbkdf2_hmac_sha1(pw, salt, work, len) {
  let pbkdf2 = asmCrypto.PBKDF2_HMAC_SHA1.bytes(
          pw.toString('binary'),
          salt.toString('binary'),
          work,
          len);

  return Buffer.from(pbkdf2).toString('base64');
}


// CryptoJS

const B64 = CryptoJS.enc.Base64;

function cjs_pbkdf2_hmac_sha1(pw, salt, work, len) {
  let pbkdf2 = CryptoJS.PBKDF2(
          B64.parse(pw.toString('base64')),
          B64.parse(salt.toString('base64')), {
            iterations: work,
            keySize: len / 4
          });

  return pbkdf2.toString(B64);
}


// Forge

function forge_pbkdf2_hmac_sha1(pw, salt, work, len) {
  let pbkdf2 = forge.pkcs5.pbkdf2(
          forge.util.decode64(pw.toString('base64')),
          forge.util.decode64(salt.toString('base64')),
          work,
          len);

  return forge.util.encode64(pbkdf2);
}


// Node.js

function node_pbkdf2_hmac_sha1(pw, salt, work, len) {
  return crypto.pbkdf2Sync(pw, salt, work, len, 'sha1').toString('base64');
}


// SJCL

const base64 = sjcl.codec.base64;

function sjcl_pbkdf2_hmac_sha1(pw, salt, work, len) {
  let pbkdf2 = sjcl.misc.pbkdf2(
          base64.toBits(pw.toString('base64')),
          base64.toBits(salt.toString('base64')),
          work,
          len * 8);

  return base64.fromBits(pbkdf2);
}


const isNode = (typeof module === 'object'),
      pw     = crypto.randomBytes(16),
      salt   = crypto.randomBytes(16),
      work   = 100,
      len    = 32;

console.log('[asm  ]', asm_pbkdf2_hmac_sha1(pw, salt, work, len));
console.log('[cjs  ]', cjs_pbkdf2_hmac_sha1(pw, salt, work, len));
console.log('[forge]', forge_pbkdf2_hmac_sha1(pw, salt, work, len));
if (isNode) console.log('[node ]', node_pbkdf2_hmac_sha1(pw, salt, work, len));
console.log('[sjcl ]', sjcl_pbkdf2_hmac_sha1(pw, salt, work, len));

let suite = new Benchmark.Suite();

suite.add('asmCrypto PBKDF2', () => asm_pbkdf2_hmac_sha1(pw, salt, work, len));
suite.add('CryptoJS PBKDF2', () => cjs_pbkdf2_hmac_sha1(pw, salt, work, len));
suite.add('Forge PBKDF2', () => forge_pbkdf2_hmac_sha1(pw, salt, work, len));
suite.add('SJCL PBKDF2', () => sjcl_pbkdf2_hmac_sha1(pw, salt, work, len));

if (isNode)
  suite.add('Node PBKDF2', () => node_pbkdf2_hmac_sha1(pw, salt, work, len));

suite.on('complete', function() {
  this.forEach((result) => console.log(result.toString()));
});

suite.run();
