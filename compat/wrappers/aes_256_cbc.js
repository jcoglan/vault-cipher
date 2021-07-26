'use strict';


// asmCrypto

function asm_aes_256_cbc(key, iv, msg) {
  let ct = asmCrypto.AES_CBC.encrypt(
          msg.toString('binary'),
          key.toString('binary'),
          undefined,
          iv.toString('binary'));

  return Buffer.from(ct).toString('base64');
}

function asm_decrypt_aes_256_cbc(key, iv, ct) {
  ct = Buffer.from(ct, 'base64');

  let pt = asmCrypto.AES_CBC.decrypt(
          ct.toString('binary'),
          key.toString('binary'),
          undefined,
          iv.toString('binary'));

  return Buffer.from(pt).toString();
}


// CryptoJS

const B64 = CryptoJS.enc.Base64;

function cjs_aes_256_cbc(key, iv, msg) {
  let ct = CryptoJS.AES.encrypt(
          B64.parse(msg.toString('base64')),
          B64.parse(key.toString('base64')), {
            iv: B64.parse(iv.toString('base64')),
            mode: CryptoJS.mode.CBC
          });

  return ct.toString();
}

function cjs_decrypt_aes_256_cbc(key, iv, ct) {
  let msg = CryptoJS.AES.decrypt(
          ct,
          B64.parse(key.toString('base64')), {
            iv: B64.parse(iv.toString('base64')),
            mode: CryptoJS.mode.CBC
          });

  return Buffer.from(msg.toString(), 'hex').toString();
}


// Forge

function forge_aes_256_cbc(key, iv, msg) {
  let password = forge.util.createBuffer(key.toString('binary')),
      ivBits   = forge.util.createBuffer(iv.toString('binary')),
      message  = forge.util.createBuffer(msg.toString('binary')),
      cipher   = forge.cipher.createCipher('AES-CBC', password);

  cipher.start({ iv: ivBits });
  cipher.update(message);
  cipher.finish();

  return forge.util.encode64(cipher.output.getBytes());
}

function forge_decrypt_aes_256_cbc(key, iv, ct) {
  ct = Buffer.from(ct, 'base64');

  let password = forge.util.createBuffer(key.toString('binary')),
      ivBits   = forge.util.createBuffer(iv.toString('binary')),
      message  = forge.util.createBuffer(ct.toString('binary')),
      cipher   = forge.cipher.createDecipher('AES-CBC', password);

  cipher.start({ iv: ivBits });
  cipher.update(message);
  cipher.finish();

  return forge.util.decodeUtf8(cipher.output.getBytes());
}


// Node.js

function node_aes_256_cbc(key, iv, msg) {
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv),
      ct = Buffer.concat([ cipher.update(msg), cipher.final() ]);

  return ct.toString('base64');
}

function node_decrypt_aes_256_cbc(key, iv, ct) {
  ct = Buffer.from(ct, 'base64');

  let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv),
      pt = Buffer.concat([ decipher.update(ct), decipher.final() ]);

  return pt.toString();
}


// WebCrypto

async function web_aes_256_cbc(key, iv, msg) {
  let subtle = (crypto.webcrypto || crypto).subtle;

  let ct = await subtle.encrypt(
    { name: 'AES-CBC', iv },
    await subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['encrypt']),
    msg);

  return Buffer.from(ct).toString('base64');
}

async function web_decrypt_aes_256_cbc(key, iv, ct) {
  let subtle = (crypto.webcrypto || crypto).subtle;
  ct = Buffer.from(ct, 'base64');

  let pt = await subtle.decrypt(
    { name: 'AES-CBC', iv },
    await subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['decrypt']),
    ct);

  return Buffer.from(pt).toString();
}


async function main() {
  const isNode  = (typeof module === 'object'),
        version = isNode && process.version.match(/[0-9]+/g).map(n => parseInt(n, 10)),
        key     = crypto.randomBytes(32),
        iv      = crypto.randomBytes(16),
        msg     = Buffer.from('I was there! When Captain Beefheart started up his first band \ud83d\ude31', 'utf8');

  console.log('[asm  ]', asm_aes_256_cbc(key, iv, msg));
  console.log('[cjs  ]', cjs_aes_256_cbc(key, iv, msg));
  console.log('[forge]', forge_aes_256_cbc(key, iv, msg));
  if (isNode) {
    console.log('[node ]', node_aes_256_cbc(key, iv, msg));
    if (version[0] >= 16) console.log('[web  ]', await web_aes_256_cbc(key, iv, msg));
  }

  console.log('[asm  ]', asm_decrypt_aes_256_cbc(key, iv, asm_aes_256_cbc(key, iv, msg)));
  console.log('[cjs  ]', cjs_decrypt_aes_256_cbc(key, iv, cjs_aes_256_cbc(key, iv, msg)));
  console.log('[forge]', forge_decrypt_aes_256_cbc(key, iv, forge_aes_256_cbc(key, iv, msg)));
  if (isNode) {
    console.log('[node ]', node_decrypt_aes_256_cbc(key, iv, node_aes_256_cbc(key, iv, msg)));
    if (version[0] >= 16) console.log('[web  ]', await web_decrypt_aes_256_cbc(key, iv, await web_aes_256_cbc(key, iv, msg)));
  }
}

main();
