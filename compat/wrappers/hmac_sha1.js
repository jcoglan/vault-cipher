'use strict';


// asmCrypto

function asm_hmac_sha1(key, msg) {
  let hmac = new asmCrypto.HmacSha1(Uint8Array.from(key))
          .process(Uint8Array.from(msg))
          .finish()
          .result;

  return Buffer.from(hmac).toString('base64');
}


// CryptoJS

const B64 = CryptoJS.enc.Base64;

function cjs_hmac_sha1(key, msg) {
  let hmac = CryptoJS.HmacSHA1(
          B64.parse(msg.toString('base64')),
          B64.parse(key.toString('base64')));

  return hmac.toString(B64);
}


// Forge

function forge_hmac_sha1(key, msg) {
  let hmac = forge.hmac.create();
  hmac.start('sha1', forge.util.decode64(key.toString('base64')));
  hmac.update(forge.util.decode64(msg.toString('base64')));

  return forge.util.encode64(hmac.digest().data);
}


// Node.js

function node_hmac_sha1(key, msg) {
  let hmac = crypto.createHmac('sha1', key);
  hmac.update(msg);
  return hmac.digest('base64');
}


const isNode = (typeof module === 'object'),
      key    = crypto.randomBytes(32),
      msg    = Buffer.from('I was there! When Captain Beefheart started up his first band \ud83d\ude31', 'utf8');

console.log('[asm  ]', asm_hmac_sha1(key, msg));
console.log('[cjs  ]', cjs_hmac_sha1(key, msg));
console.log('[forge]', forge_hmac_sha1(key, msg));
if (isNode) console.log('[node ]', node_hmac_sha1(key, msg));

let suite = new Benchmark.Suite();

suite.add('asmCrypto HMAC', () => asm_hmac_sha1(key, msg));
suite.add('CryptoJS HMAC', () => cjs_hmac_sha1(key, msg));
suite.add('Forge HMAC', () => forge_hmac_sha1(key, msg));

if (isNode)
  suite.add('Node HMAC', () => node_hmac_sha1(key, msg));

suite.on('complete', function() {
  this.forEach((result) => console.log(result.toString()));
});

suite.run();
