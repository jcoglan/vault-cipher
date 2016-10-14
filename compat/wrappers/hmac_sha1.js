'use strict';


// asmCrypto

function asm_hmac_sha1(key, msg) {
  var hmac = asmCrypto.HMAC_SHA1.bytes(
          msg.toString('binary'),
          key.toString('binary'));

  return new Buffer(hmac).toString('base64');
}


// CryptoJS

var B64 = CryptoJS.enc.Base64;

function cjs_hmac_sha1(key, msg) {
  var hmac = CryptoJS.HmacSHA1(
          B64.parse(msg.toString('base64')),
          B64.parse(key.toString('base64')));

  return hmac.toString(B64);
}


// Forge

function forge_hmac_sha1(key, msg) {
  var hmac = forge.hmac.create();
  hmac.start('sha1', forge.util.decode64(key.toString('base64')));
  hmac.update(forge.util.decode64(msg.toString('base64')));

  return forge.util.encode64(hmac.digest().data);
}


// Node.js

function node_hmac_sha1(key, msg) {
  var hmac = crypto.createHmac('sha1', key);
  hmac.update(msg);
  return hmac.digest('base64');
}


var isNode = (typeof module === 'object'),
    key    = crypto.randomBytes(32),
    msg    = new Buffer('I was there! When Captain Beefheart started up his first band \ud83d\ude31', 'utf8');

console.log('[asm  ]', asm_hmac_sha1(key, msg));
console.log('[cjs  ]', cjs_hmac_sha1(key, msg));
console.log('[forge]', forge_hmac_sha1(key, msg));
if (isNode) console.log('[node ]', node_hmac_sha1(key, msg));
