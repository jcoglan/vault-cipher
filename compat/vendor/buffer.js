const Buffer = require('../../lib/buffer').Buffer;

window.Buffer = Buffer;

window.crypto.randomBytes = function(n) {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(n)));
};
