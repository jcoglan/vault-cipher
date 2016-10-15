var Buffer = require('../../lib/buffer').Buffer;

window.Buffer = Buffer;

window.crypto.randomBytes = function(n) {
  return new Buffer(crypto.getRandomValues(new Uint8Array(n)));
};
