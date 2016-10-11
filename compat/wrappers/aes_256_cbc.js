'use strict';


// asmCrypto

function asm_aes_256_cbc(key, iv, msg) {
  var ct = asmCrypto.AES_CBC.encrypt(
          msg.toString('binary'),
          key.toString('binary'),
          undefined,
          iv.toString('binary'));

  return new Buffer(ct).toString('base64');
}

function asm_decrypt_aes_256_cbc(key, iv, ct) {
  ct = new Buffer(ct, 'base64');

  var pt = asmCrypto.AES_CBC.decrypt(
          ct.toString('binary'),
          key.toString('binary'),
          undefined,
          iv.toString('binary'));

  return new Buffer(pt).toString();
}


// CryptoJS

var B64 = CryptoJS.enc.Base64;

function cjs_aes_256_cbc(key, iv, msg) {
  var ct = CryptoJS.AES.encrypt(
          B64.parse(msg.toString('base64')),
          B64.parse(key.toString('base64')), {
            iv: B64.parse(iv.toString('base64')),
            mode: CryptoJS.mode.CBC
          });

  return ct.toString();
}

function cjs_decrypt_aes_256_cbc(key, iv, ct) {
  var msg = CryptoJS.AES.decrypt(
          ct,
          B64.parse(key.toString('base64')), {
            iv: B64.parse(iv.toString('base64')),
            mode: CryptoJS.mode.CBC
          });

  return new Buffer(msg.toString(), 'hex').toString();
}


// Forge

function forge_aes_256_cbc(key, iv, msg) {
  var password = forge.util.createBuffer(key.toString('binary')),
      ivBits   = forge.util.createBuffer(iv.toString('binary')),
      message  = forge.util.createBuffer(msg.toString('binary')),
      cipher   = forge.cipher.createCipher('AES-CBC', password);

  cipher.start({iv: ivBits});
  cipher.update(message);
  cipher.finish();

  return forge.util.encode64(cipher.output.getBytes());
}

function forge_decrypt_aes_256_cbc(key, iv, ct) {
  ct = new Buffer(ct, 'base64');

  var password = forge.util.createBuffer(key.toString('binary')),
      ivBits   = forge.util.createBuffer(iv.toString('binary')),
      message  = forge.util.createBuffer(ct.toString('binary')),
      cipher   = forge.cipher.createDecipher('AES-CBC', password);

  cipher.start({iv: ivBits});
  cipher.update(message);
  cipher.finish();

  return forge.util.decodeUtf8(cipher.output.getBytes());
}


// Node.js

function node_aes_256_cbc(key, iv, msg) {
  var cipher = crypto.createCipheriv('aes-256-cbc', key, iv),
      ct = Buffer.concat([ cipher.update(msg), cipher.final() ]);

  return ct.toString('base64');
}

function node_decrypt_aes_256_cbc(key, iv, ct) {
  ct = new Buffer(ct, 'base64');

  var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv),
      pt = Buffer.concat([ decipher.update(ct), decipher.final() ]);

  return pt.toString();
}


var isNode = (typeof module === 'object'),
    key    = crypto.randomBytes(32),
    iv     = crypto.randomBytes(16),
    msg    = new Buffer('I was there! When Captain Beefheart started up his first band \ud83d\ude31', 'utf8');

console.log('[asm  ]', asm_aes_256_cbc(key, iv, msg));
console.log('[cjs  ]', cjs_aes_256_cbc(key, iv, msg));
console.log('[forge]', forge_aes_256_cbc(key, iv, msg));
if (isNode) console.log('[node ]', node_aes_256_cbc(key, iv, msg));

console.log('[asm  ]', asm_decrypt_aes_256_cbc(key, iv, asm_aes_256_cbc(key, iv, msg)));
console.log('[cjs  ]', cjs_decrypt_aes_256_cbc(key, iv, cjs_aes_256_cbc(key, iv, msg)));
console.log('[forge]', forge_decrypt_aes_256_cbc(key, iv, forge_aes_256_cbc(key, iv, msg)));
if (isNode) console.log('[node ]', node_decrypt_aes_256_cbc(key, iv, node_aes_256_cbc(key, iv, msg)));
