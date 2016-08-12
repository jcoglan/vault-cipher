'use strict';

module.exports = {
  decode: function(string) {
    var data = [],
        n    = string.length,
        c, d;

    for (var i = 0; i < string.length; i++) {
      c = string.charCodeAt(i);
      d = string.charCodeAt(i + 1);

      if (c >= 0xd800 && c <= 0xdbff && d >= 0xdc00 && d <= 0xdfff) {
        c = 0x10000 + ((c - 0xd800) << 10) + (d - 0xdc00);
        i += 1;
      } 

      if (c >= 0xd800 && c <= 0xdfff) c = 0xfffd;

      if (c <= 0x7f) {
        data.push(c);
      }
      else if (c <= 0x7ff) {
        data.push(0xc0 | (c >>>  6), 0x80 | c % 0x40);
      }
      else if (c <= 0xffff) {
        data.push(0xe0 | (c >>> 12), 0x80 | (c >>>  6) % 0x40, 0x80 | c % 0x40);
      }
      else if (c <= 0x10ffff) {
        data.push(0xf0 | (c >>> 18), 0x80 | (c >>> 12) % 0x40, 0x80 | (c >>> 6) % 0x40, 0x80 | c % 0x40);
      }
    }

    return String.fromCharCode.apply(String, data);
  },

  encode: function(data) {
    var codepoints = [],
        offset     = 0,
        n          = data.length,
        b, c;

    while (offset < n) {
      b = [
        data.charCodeAt(offset),
        data.charCodeAt(offset + 1),
        data.charCodeAt(offset + 2),
        data.charCodeAt(offset + 3)
      ];

      c = b.shift();
      b = b.map(function(x) { return x >>> 6 === 2 ? x : NaN });

      if (c <= 0x7f) {
        offset += 1;
      }
      else if (c >= 0xc2 && c <= 0xdf && b[0]) {
        offset += 2;
        c = c % 0x20 <<  6 | b[0] % 0x40;
      }
      else if ((c === 0xe0              && b[0] >= 0xa0 && b[1])
            || (c >=  0xe1 && c <= 0xec && b[0]         && b[1])
            || (c === 0xed              && b[0] <= 0x9f && b[1])
            || (c >=  0xee && c <= 0xef && b[0]         && b[1])) {
        offset += 3;
        c = c % 0x10 << 12 | b[0] % 0x40 <<  6 | b[1] % 0x40;
      }
      else if ((c === 0xf0              && b[0] >= 0x90 && b[1] && b[2])
            || (c >=  0xf1 && c <= 0xf3 && b[0]         && b[1] && b[2])
            || (c === 0xf4              && b[0] <= 0x8f && b[1] && b[2])) {
        offset += 4;
        c = c % 0x08 << 18 | b[0] % 0x40 << 12 | b[1] % 0x40 << 6 | b[2] % 0x40;
      }
      else {
        offset += 1;
        c = 0xfffd;
      }

      if (c <= 0xffff) {
        codepoints.push(c);
      } else {
        c -= 0x10000;
        codepoints.push(0xd800 + (c >>> 10), 0xdc00 + (c % 0x400));
      }
    }

    return String.fromCharCode.apply(String, codepoints);
  }
};
