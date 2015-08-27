'use strict';

module.exports = {
  decode: function(string) {
    var data = [],
        n    = string.length,
        c, d;

    for (var i = 0; i < string.length; i++) {
      c = string.charCodeAt(i);

      if (c >= 0xd800 && c <= 0xdbff) {
        d = string.charCodeAt(i + 1);
        if (isNaN(d) || d < 0xdc00 || d > 0xdfff) {
          throw new Error('Illegal low surrogate ' + d + ' at offset ' + i);
        }
        c = 0x10000 + ((c - 0xd800) << 10) + (d - 0xdc00);
        i += 1;
      } 

      if (c <= 0x7f) {
        data.push(c);
      } else if (c <= 0x7ff) {
        data.push(0xc0 | (c >>>  6), 0x80 | c % 0x40);
      } else if (c <= 0xffff) {
        data.push(0xe0 | (c >>> 12), 0x80 | (c >>>  6) % 0x40, 0x80 | c % 0x40);
      } else if (c <= 0x10ffff) {
        data.push(0xf0 | (c >>> 18), 0x80 | (c >>> 12) % 0x40, 0x80 | (c >>> 6) % 0x40, 0x80 | c % 0x40);
      } else {
        throw new Error('UTF-8 encoding error: Illegal code point ' + c + ' at offset ' + i);
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

      b = [b[0], (b[1] & 0x80 ? b[1] : NaN), (b[2] & 0x80 ? b[2] : NaN), (b[3] & 0x80 ? b[3] : NaN)];
      c = b[0];

      if (c <= 127) {
        offset += 1;
      } else if (c <= 223) {
        c = (b[0] % 0x20 <<  6) + (b[1] % 0x40);
        offset += 2;
      } else if (c <= 239) {
        c = (b[0] % 0x10 << 12) + (b[1] % 0x40 <<  6) + (b[2] % 0x40);
        offset += 3;
      } else if (c <= 244) {
        c = (b[0] % 0x08 << 18) + (b[1] % 0x40 << 12) + (b[2] % 0x40 << 6) + (b[3] % 0x40);
        offset += 4;
      } else {
        throw new Error('UTF-8 encoding error: Illegal leading byte ' + c + ' at offset ' + offset);
      }

      if (isNaN(c))
        throw new Error('UTF-8 encoding error: Insufficient bytes at offset ' + offset);
      if (c > 0x10ffff || (c >= 0xd800 && c <= 0xdfff))
        throw new Error('UTF-8 encoding error: Illegal code point ' + c + ' at offset ' + offset);

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
