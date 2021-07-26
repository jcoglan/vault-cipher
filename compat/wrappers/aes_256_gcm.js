'use strict';


// asmCrypto

function asm_aes_256_gcm(key, iv, msg) {
  let ct = asmCrypto.AES_GCM.encrypt(
          msg.toString('binary'),
          key.toString('binary'),
          iv.toString('binary'),
          null, 16);

  return Buffer.from(ct).toString('base64');
}

function asm_decrypt_aes_256_gcm(key, iv, ct) {
  ct = Buffer.from(ct, 'base64');

  let pt = asmCrypto.AES_GCM.decrypt(
          ct.toString('binary'),
          key.toString('binary'),
          iv.toString('binary'),
          null, 16);

  return Buffer.from(pt).toString();
}


// Forge

function forge_aes_256_gcm(key, iv, msg) {
  let password = forge.util.createBuffer(key.toString('binary')),
      ivBits   = forge.util.createBuffer(iv.toString('binary')),
      message  = forge.util.createBuffer(msg.toString('binary')),
      cipher   = forge.cipher.createCipher('AES-GCM', password);

  cipher.start({ iv: ivBits, tagLength: 128 });
  cipher.update(message);
  cipher.finish();

  return forge.util.encode64(cipher.output.getBytes() + cipher.mode.tag.getBytes());
}

function forge_decrypt_aes_256_gcm(key, iv, msg) {
  msg = Buffer.from(msg, 'base64');

  let ct  = msg.slice(0, msg.length - 16),
      tag = msg.slice(msg.length - 16, msg.length);

  let password = forge.util.createBuffer(key.toString('binary')),
      ivBits   = forge.util.createBuffer(iv.toString('binary')),
      message  = forge.util.createBuffer(ct.toString('binary')),
      cipher   = forge.cipher.createDecipher('AES-GCM', password);

  cipher.start({
    iv:  ivBits,
    tag: forge.util.createBuffer(tag.toString('binary'))
  });
  cipher.update(message);
  cipher.finish();

  return forge.util.decodeUtf8(cipher.output.getBytes());
}


// Node.js

function node_aes_256_gcm(key, iv, msg) {
  let opts   = { authTagLength: 16 },
      cipher = crypto.createCipheriv('aes-256-gcm', key, iv, opts),
      ct     = Buffer.concat([ cipher.update(msg), cipher.final(), cipher.getAuthTag() ]);

  return ct.toString('base64');
}

function node_decrypt_aes_256_gcm(key, iv, msg) {
  msg = Buffer.from(msg, 'base64');

  let ct       = msg.slice(0, msg.length - 16),
      authTag  = msg.slice(msg.length - 16, msg.length),
      opts     = { authTagLength: 16 },
      decipher = crypto.createDecipheriv('aes-256-gcm', key, iv, opts);

  decipher.setAuthTag(authTag);
  let pt = Buffer.concat([ decipher.update(ct), decipher.final() ]);

  return pt.toString();
}


// SJCL

const base64 = sjcl.codec.base64;

function sjcl_aes_256_gcm(key, iv, msg) {
  let password = base64.toBits(key.toString('base64')),
      ivBits   = base64.toBits(iv.toString('base64')),
      message  = base64.toBits(msg.toString('base64')),
      aes      = new sjcl.cipher.aes(password),
      ct       = sjcl.mode.gcm.encrypt(aes, message, ivBits, null, 128);

  return base64.fromBits(ct);
}

function sjcl_decrypt_aes_256_gcm(key, iv, ct) {
  let password = base64.toBits(key.toString('base64')),
      ivBits   = base64.toBits(iv.toString('base64')),
      ctBits   = base64.toBits(ct),
      aes      = new sjcl.cipher.aes(password),
      pt       = sjcl.mode.gcm.decrypt(aes, ctBits, ivBits, null, 128);

  return sjcl.codec.utf8String.fromBits(pt);
}


const isNode = (typeof module === 'object'),
      key    = crypto.randomBytes(32),
      iv     = crypto.randomBytes(12),
      msg    = Buffer.from('I was there! When Captain Beefheart started up his first band \ud83d\ude31', 'utf8');

console.log('[asm  ]', asm_aes_256_gcm(key, iv, msg));
console.log('[forge]', forge_aes_256_gcm(key, iv, msg));
if (isNode) console.log('[node ]', node_aes_256_gcm(key, iv, msg));
console.log('[sjcl ]', sjcl_aes_256_gcm(key, iv, msg));

console.log('[asm  ]', asm_decrypt_aes_256_gcm(key, iv, asm_aes_256_gcm(key, iv, msg)));
console.log('[forge]', forge_decrypt_aes_256_gcm(key, iv, forge_aes_256_gcm(key, iv, msg)));
if (isNode) console.log('[node ]', node_decrypt_aes_256_gcm(key, iv, node_aes_256_gcm(key, iv, msg)));
console.log('[sjcl ]', sjcl_decrypt_aes_256_gcm(key, iv, sjcl_aes_256_gcm(key, iv, msg)));
