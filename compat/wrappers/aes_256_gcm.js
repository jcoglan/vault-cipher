'use strict';


// Forge

function forge_aes_256_gcm(key, iv, msg) {
  var password = forge.util.createBuffer(key.toString('binary')),
      ivBits   = forge.util.createBuffer(iv.toString('binary')),
      message  = forge.util.createBuffer(msg.toString('binary')),
      cipher   = forge.cipher.createCipher('AES-GCM', password);

  cipher.start({iv: ivBits});
  cipher.update(message);
  cipher.finish();

  return forge.util.encode64(cipher.output.getBytes() + cipher.mode.tag.getBytes());
}

function forge_decrypt_aes_256_gcm(key, iv, msg) {
  msg = new Buffer(msg, 'base64');

  var ct  = msg.slice(0, msg.length - 16),
      tag = msg.slice(msg.length - 16, msg.length);

  var password = forge.util.createBuffer(key.toString('binary')),
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
  var cipher = crypto.createCipheriv('aes-256-gcm', key, iv),
      ct = Buffer.concat([ cipher.update(msg), cipher.final(), cipher.getAuthTag() ]);

  return ct.toString('base64');
}

function node_decrypt_aes_256_gcm(key, iv, msg) {
  msg = new Buffer(msg, 'base64');

  var ct       = msg.slice(0, msg.length - 16),
      authTag  = msg.slice(msg.length - 16, msg.length),
      decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

  decipher.setAuthTag(authTag);
  var pt = Buffer.concat([ decipher.update(ct), decipher.final() ]);

  return pt.toString();
}


// SJCL

var base64 = sjcl.codec.base64;

function sjcl_aes_256_gcm(key, iv, msg) {
  var password = base64.toBits(key.toString('base64')),
      ivBits   = base64.toBits(iv.toString('base64')),
      message  = base64.toBits(msg.toString('base64')),
      aes      = new sjcl.cipher.aes(password),
      ct       = sjcl.mode.gcm.encrypt(aes, message, ivBits);

  return base64.fromBits(ct);
}

function sjcl_decrypt_aes_256_gcm(key, iv, ct) {
  var password = base64.toBits(key.toString('base64')),
      ivBits   = base64.toBits(iv.toString('base64')),
      ctBits   = base64.toBits(ct),
      aes      = new sjcl.cipher.aes(password),
      pt       = sjcl.mode.gcm.decrypt(aes, ctBits, ivBits);

  return sjcl.codec.utf8String.fromBits(pt);
}


if (typeof module === 'object')
  module.exports = {
    forge_aes_256_gcm:         forge_aes_256_gcm,
    forge_decrypt_aes_256_gcm: forge_decrypt_aes_256_gcm,
    node_aes_256_gcm:          node_aes_256_gcm,
    node_decrypt_aes_256_gcm:  node_decrypt_aes_256_gcm,
    sjcl_aes_256_gcm:          sjcl_aes_256_gcm,
    sjcl_decrypt_aes_256_gcm:  sjcl_decrypt_aes_256_gcm
  };
