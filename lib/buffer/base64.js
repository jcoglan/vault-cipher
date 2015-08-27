'use strict';

var indexOf = function(list, needle) {
  if (list.indexOf) return list.indexOf(needle);
  for (var i = 0, n = list.length; i < n; i++) {
    if (list[i] === needle) return i;
  }
  return -1;
};

module.exports = {
  CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split(''),

  decode: function(string) {
    var data  = [],
        chars = this.CHARS,
        n     = string.length,
        i, c, offset, chunk, padding;

    for (offset = 0; offset < n; offset += 4) {
      chunk   = 0;
      padding = 0;

      for (i = 0; i < 4; i++) {
        c = string[offset + i];
        if (c === '=') {
          padding += 1;
        } else {
          chunk |= indexOf(chars, c) << 6 * (3 - i);
        }
      }
      for (i = 0; i < 3 - padding; i++) {
        data.push((chunk >>> 8 * (2 - i)) % 0x100);
      }
    }

    return String.fromCharCode.apply(String, data);
  },

  encode: function(data) {
    var string = '',
        chars  = this.CHARS,
        n      = data.length,
        i, c, offset, chunk, padding;

    for (offset = 0; offset < n; offset += 3) {
      chunk   = 0;
      padding = 0;

      for (i = 0; i < 3; i++) {
        c = data.charCodeAt(offset + i);
        if (isNaN(c)) {
          padding += 1;
        } else {
          chunk |= c << 8 * (2 - i);
        }
      }
      for (i = 0; i < 4 - padding; i++) {
        string += chars[(chunk >>> 6 * (3 - i)) % 0x40];
      }
      while (padding--) string += '=';
    }

    return string;
  }
};
