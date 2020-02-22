'use strict';

module.exports = {
  CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split(''),

  decode(string) {
    let data  = [],
        chars = this.CHARS,
        n     = string.length;

    for (let offset = 0; offset < n; offset += 4) {
      let chunk   = 0,
          padding = 0;

      for (let i = 0; i < 4; i++) {
        let c = string[offset + i];
        if (c === '=') {
          padding += 1;
        } else {
          chunk |= chars.indexOf(c) << 6 * (3 - i);
        }
      }
      for (let i = 0; i < 3 - padding; i++) {
        data.push((chunk >>> 8 * (2 - i)) % 0x100);
      }
    }

    return String.fromCharCode.apply(String, data);
  },

  encode(data) {
    let string = '',
        chars  = this.CHARS,
        n      = data.length;

    for (let offset = 0; offset < n; offset += 3) {
      let chunk   = 0,
          padding = 0;

      for (let i = 0; i < 3; i++) {
        let c = data.charCodeAt(offset + i);
        if (isNaN(c)) {
          padding += 1;
        } else {
          chunk |= c << 8 * (2 - i);
        }
      }
      for (let i = 0; i < 4 - padding; i++) {
        string += chars[(chunk >>> 6 * (3 - i)) % 0x40];
      }
      while (padding--) string += '=';
    }

    return string;
  }
};
