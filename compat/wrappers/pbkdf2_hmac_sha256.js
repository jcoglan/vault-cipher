'use strict';


// asmCrypto

function asm_pbkdf2_hmac_sha256(pw, salt, work, len) {
  let pbkdf2 = asmCrypto.PBKDF2_HMAC_SHA256.bytes(
          pw.toString('binary'),
          salt.toString('binary'),
          work,
          len);

  return Buffer.from(pbkdf2).toString('base64');
}


// CryptoJS

const B64 = CryptoJS.enc.Base64;

function cjs_pbkdf2_hmac_sha256(pw, salt, work, len) {
  let pbkdf2 = CryptoJS.PBKDF2(
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
  let pbkdf2 = forge.pkcs5.pbkdf2(
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

const base64 = sjcl.codec.base64;

function sjcl_pbkdf2_hmac_sha256(pw, salt, work, len) {
  let pbkdf2 = sjcl.misc.pbkdf2(
          base64.toBits(pw.toString('base64')),
          base64.toBits(salt.toString('base64')),
          work,
          len * 8);

  return base64.fromBits(pbkdf2);
}


// WebCrypto

async function web_pbkdf2_hmac_sha256(pw, salt, work, len) {
  let subtle = (crypto.webcrypto || crypto).subtle;

  let key = await subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: work },
    await subtle.importKey('raw', pw, 'PBKDF2', false, ['deriveKey']),
    { name: 'AES-CBC', length: 8 * len },
    true,
    ['encrypt']);

  let extracted = await subtle.exportKey('raw', key);
  return Buffer.from(extracted).toString('base64');
}


async function main() {
  const isNode  = (typeof module === 'object'),
        version = isNode && process.version.match(/[0-9]+/g).map(n => parseInt(n, 10)),
        pw      = crypto.randomBytes(16),
        salt    = crypto.randomBytes(16),
        work    = 100,
        len     = 32;

  console.log('[asm  ]', asm_pbkdf2_hmac_sha256(pw, salt, work, len));
  console.log('[cjs  ]', cjs_pbkdf2_hmac_sha256(pw, salt, work, len));
  console.log('[forge]', forge_pbkdf2_hmac_sha256(pw, salt, work, len));
  console.log('[sjcl ]', sjcl_pbkdf2_hmac_sha256(pw, salt, work, len));
  if (isNode) {
    console.log('[node ]', node_pbkdf2_hmac_sha256(pw, salt, work, len));
    if (version[0] >= 16) console.log('[web  ]', await web_pbkdf2_hmac_sha256(pw, salt, work, len));
  }

  let suite = new Benchmark.Suite();

  suite.add('asmCrypto PBKDF2', () => asm_pbkdf2_hmac_sha256(pw, salt, work, len));
  suite.add('CryptoJS PBKDF2', () => cjs_pbkdf2_hmac_sha256(pw, salt, work, len));
  suite.add('Forge PBKDF2', () => forge_pbkdf2_hmac_sha256(pw, salt, work, len));
  suite.add('SJCL PBKDF2', () => sjcl_pbkdf2_hmac_sha256(pw, salt, work, len));

  if (isNode) {
    suite.add('Node PBKDF2', () => node_pbkdf2_hmac_sha256(pw, salt, work, len));

    if (version[0] >= 16)
      suite.add('WebCrypto PBKDF2', {
        defer: true,
        async fn(deferred) {
          await web_pbkdf2_hmac_sha256(pw, salt, work, len);
          deferred.resolve();
        }
      });
  }

  suite.on('complete', function() {
    this.forEach((result) => console.log(result.toString()));
  });

  suite.run();
}

main();
