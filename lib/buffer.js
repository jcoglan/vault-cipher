(function() {
'use strict';

var indexOf = function(list, needle) {
  if (list.indexOf) return list.indexOf(needle);
  for (var i = 0, n = list.length; i < n; i++) {
    if (list[i] === needle) return i;
  }
  return -1;
};

var Base64 = {
  CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split(''),

  decode: function(string) {
    var data  = [],
        chars = Base64.CHARS,
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
        chars  = Base64.CHARS,
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

var Binary = {
  decode: function(string) {
    return string;
  },

  encode: function(data) {
    return data;
  }
};

var Hex = {
  decode: function(string) {
    var data = [];
    for (var i = 0, n = string.length; i < n; i += 2) {
      data[i / 2] = parseInt(string.substr(i, 2), 16);
    }
    return String.fromCharCode.apply(String, data);
  },

  encode: function(data) {
    var string = '', block;
    for (var i = 0, n = data.length; i < n; i++) {
      block = data.charCodeAt(i).toString(16);

      if (block.length === 1) block = '0' + block;

      if (block.length > 2)
        throw new Error('Hex encoding error: Found value ' + block + ' at offset ' + i);

      string += block;
    }
    return string;
  }
};

var UTF8 = {
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

var Buffer = function(data, encoding) {
  if (!(this instanceof Buffer)) return new Buffer(data, encoding);

  if (data instanceof Buffer) {
    data = data._data;
  } else if (data instanceof Array) {
    data = String.fromCharCode.apply(String, data);
  } else if (typeof data === 'number') {
    data = String.fromCharCode.apply(String, Array(data));
  } else if (typeof data === 'string') {
    encoding = encoding || 'utf8';
    data = Buffer.ENCODERS[encoding].decode(data);
  }
  this._data  = data;
  this.length = data.length;
};

Buffer.ENCODERS = {
  base64: Base64,
  binary: Binary,
  hex:    Hex,
  utf8:   UTF8
};

Buffer.concat = function(list, totalLength, BufferClass) {
  var i, n;

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (i = 0, n = list.length; i < n; i++) {
      totalLength += list[i].length;
    }
  }

  BufferClass = BufferClass || Buffer;

  var buffer = new BufferClass(totalLength),
      offset = 0;

  for (i = 0, n = list.length; i < n; i++) {
    list[i].copy(buffer, offset);
    offset += list[i].length;
  }
  return buffer;
};

Buffer.prototype.copy = function(target, targetStart, sourceStart, sourceEnd) {
  targetStart = targetStart || 0;
  sourceStart = sourceStart || 0;
  sourceEnd   = sourceEnd   || this._data.length;

  target._data = target._data.substring(0, targetStart) +
                 this._data.substring(sourceStart, sourceEnd) +
                 target._data.substring(targetStart + sourceEnd - sourceStart, target._data.length);

  target.length = target._data.length;
};

Buffer.prototype.inspect = function() {
  return '<Buffer ' + this.toString('hex').match(/../g).join(' ') + '>';
};

Buffer.prototype.slice = function(start, end) {
  return new Buffer(this._data.substring(start, end), 'binary');
};

Buffer.prototype.toString = function(encoding) {
  encoding = encoding || 'utf8';
  return Buffer.ENCODERS[encoding].encode(this._data);
};

if (typeof module !== 'undefined')
  module.exports = Buffer;
else if (typeof window !== 'undefined')
  window.Buffer = Buffer;

})();

