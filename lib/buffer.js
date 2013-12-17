(function() {
'use strict';

var indexOf = function(list, needle) {
  if (list.indexOf) return list.indexOf(needle);
  for (var i = 0, n = list.length; i < n; i++) {
    if (list[i] === needle) return i;
  }
  return -1;
};

var pad = function(n, b, k) {
  n = n.toString(b);
  return Array(k + 1 - n.length).join('0') + n;
};

var Base64 = {
  CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split(''),

  decode: function(string) {
    var data  = [],
        chars = Base64.CHARS,
        n     = string.length,
        i, c, offset, chunk, padding;

    for (offset = 0; offset < n; offset += 4) {
      chunk   = [];
      padding = 0;

      for (i = 0; i < 4; i++) {
        c = string[offset + i];
        if (c === '=')
          padding += 1;
        else
          chunk[i] = pad(indexOf(chars, c), 2, 6);
      }
      chunk = chunk.join('').match(/.{8}/g);
      for (i = 0; i < 3 - padding; i++) {
        data.push(parseInt(chunk[i], 2));
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
      chunk   = [];
      padding = 0;

      for (i = 0; i < 3; i++) {
        c = data.charCodeAt(offset + i);
        if (isNaN(c))
          padding += 1;
        else
          chunk[i] = pad(c, 2, 8);
      }
      for (i = 0; i < padding; i++) chunk.push('00000000');
      chunk = chunk.join('').match(/.{6}/g);
      for (i = 0; i < 4 - padding; i++) {
        string += chars[parseInt(chunk[i], 2)];
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
    var string = '';
    for (var i = 0, n = data.length; i < n; i++) {
      string += pad(data.charCodeAt(i), 16, 2);
    }
    return string;
  }
};

var UTF8 = {
  decode: function(string) {
    var data = [],
        n    = string.length,
        c, b;

    for (var i = 0; i < string.length; i++) {
      c = string.charCodeAt(i);

      if (c >= 0xd800 && c <= 0xdbff) {
        c = 0x10000 + (c - 0xd800) * 0x400 + (string.charCodeAt(i + 1) - 0xdc00);
        i += 1;
      } 

      if (c <= 0x7f) {
        data.push(c);
      } else if (c <= 0x7ff) {
        b = pad(c, 2, 11);
        data.push(parseInt('110' + b.substr(0,5), 2), parseInt('10' + b.substr(5,6), 2));
      } else if (c <= 0xffff) {
        b = pad(c, 2, 16);
        data.push(parseInt('1110' + b.substr(0,4), 2), parseInt('10' + b.substr(4,6), 2), parseInt('10' + b.substr(10,6), 2));
      } else if (c <= 0x10ffff) {
        b = pad(c, 2, 21);
        data.push(parseInt('11110' + b.substr(0,3), 2), parseInt('10' + b.substr(3,6), 2), parseInt('10' + b.substr(9,6), 2), parseInt('10' + b.substr(15,6), 2));
      } else {
        throw new Error('UTF-8 encoding error: Invalid code point: ' + c);
      }
    }

    return String.fromCharCode.apply(String, data);
  },

  encode: function(data) {
    var codepoints = [],
        offset     = 0,
        n          = data.length,
        i, c, binary, match;

    while (offset < n) {
      c = data.charCodeAt(offset);
      binary = '';

      if (c <= 127) {
        match = pad(c, 2, 7).match(/^(.*)$/);
        offset += 1;
      } else if (c <= 223) {
        match = (pad(data.charCodeAt(offset), 2, 8) + pad(data.charCodeAt(offset + 1), 2, 8)).match(/^110(.{5})10(.{6})$/);
        offset += 2;
      } else if (c <= 239) {
        for (i = 0; i < 3; i++) binary += pad(data.charCodeAt(offset + i), 2, 8);
        match = binary.match(/^1110(.{4})10(.{6})10(.{6})$/);
        offset += 3;
      } else if (c <= 247) {
        for (i = 0; i < 4; i++) binary += pad(data.charCodeAt(offset + i), 2, 8);
        match = binary.match(/^11110(.{3})10(.{6})10(.{6})10(.{6})$/);
        offset += 4;
      }

      if (!match) throw new Error('UTF-8 encoding error');

      binary = '';
      for (i = 1; i < match.length; i++) binary += match[i];

      c = parseInt(binary, 2);
      if (c <= 0xffff) {
        codepoints.push(c);
      } else {
        c -= 0x10000;
        codepoints.push(0xd800 + Math.floor(c / 0x400), 0xdc00 + (c % 0x400));
      }
    }

    return String.fromCharCode.apply(String, codepoints);
  }
};

var Buffer = function(data, encoding) {
  if (data instanceof Buffer) {
    return data;
  } else if (data instanceof Array) {
    data = String.fromCharCode.apply(String, data);
  } else if (typeof data === 'number') {
    data = '';
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

Buffer.prototype.concat = function(other) {
  return new Buffer(this._data + other._data, 'binary');
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

