'use strict';


// asmCrypto

function asm_hmac_sha256(key, msg) {
  var hmac = asmCrypto.HMAC_SHA256.bytes(
          msg.toString('binary'),
          key.toString('binary'));

  return Buffer.from(hmac).toString('base64');
}


// CryptoJS

var B64 = CryptoJS.enc.Base64;

function cjs_hmac_sha256(key, msg) {
  var hmac = CryptoJS.HmacSHA256(
          B64.parse(msg.toString('base64')),
          B64.parse(key.toString('base64')));

  return hmac.toString(B64);
}


// Forge

function forge_hmac_sha256(key, msg) {
  var hmac = forge.hmac.create();
  hmac.start('sha256', forge.util.decode64(key.toString('base64')));
  hmac.update(forge.util.decode64(msg.toString('base64')));

  return forge.util.encode64(hmac.digest().data);
}


// Node.js

function node_hmac_sha256(key, msg) {
  var hmac = crypto.createHmac('sha256', key);
  hmac.update(msg);
  return hmac.digest('base64');
}


// SJCL

var base64 = sjcl.codec.base64;

function sjcl_hmac_sha256(key, msg) {
  var hmac = new sjcl.misc.hmac(
          base64.toBits(key.toString('base64')),
          sjcl.hash.sha256);

  var hash = hmac.encrypt(base64.toBits(msg.toString('base64')));

  return base64.fromBits(hash);
}


var isNode = (typeof module === 'object'),
    key    = crypto.randomBytes(32),
    msg    = Buffer.from('I was there! When Captain Beefheart started up his first band \ud83d\ude31', 'utf8');

console.log('[asm  ]', asm_hmac_sha256(key, msg));
console.log('[cjs  ]', cjs_hmac_sha256(key, msg));
console.log('[forge]', forge_hmac_sha256(key, msg));
if (isNode) console.log('[node ]', node_hmac_sha256(key, msg));
console.log('[sjcl ]', sjcl_hmac_sha256(key, msg));

var suite = new Benchmark.Suite();

suite.add('asmCrypto HMAC', function() {
  asm_hmac_sha256(key, msg);
});

suite.add('CryptoJS HMAC', function() {
  cjs_hmac_sha256(key, msg);
});

suite.add('Forge HMAC', function() {
  forge_hmac_sha256(key, msg);
});

suite.add('SJCL HMAC', function() {
  sjcl_hmac_sha256(key, msg);
});

if (isNode)
  suite.add('Node HMAC', function() {
    node_hmac_sha256(key, msg);
  });

suite.on('complete', function() {
  this.forEach(function(result) { console.log(result.toString()) });
});

suite.run();
