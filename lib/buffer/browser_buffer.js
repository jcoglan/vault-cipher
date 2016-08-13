'use strict';

var readInt  = require('./read_int'),
    writeInt = require('./write_int');

var ENCODINGS = {
  base64: require('./base64'),
  binary: require('./binary'),
  hex:    require('./hex'),
  utf8:   require('./utf8')
};

var Uint8Array = global.Uint8Array;

var Buffer = function(data, encoding) {
  if (!(this instanceof Buffer)) return new Buffer(data, encoding);

  if (data instanceof Buffer) {
    data = data._data;
  } else if (data instanceof Array || (Uint8Array && data instanceof Uint8Array)) {
    data = String.fromCharCode.apply(String, data);
  } else if (typeof data === 'number') {
    data = String.fromCharCode.apply(String, Array(data));
  } else if (typeof data === 'string') {
    encoding = encoding || 'utf8';
    data = ENCODINGS[encoding].decode(data);
  }
  this._data  = data;
  this.length = data.length;
};

Buffer.concat = function(list, totalLength) {
  var i, n;

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (i = 0, n = list.length; i < n; i++) {
      totalLength += list[i].length;
    }
  }

  var buffer = new Buffer(totalLength),
      offset = 0;

  for (i = 0, n = list.length; i < n; i++) {
    list[i].copy(buffer, offset);
    offset += list[i].length;
  }
  return buffer;
};

Buffer.prototype.copy = function(target, targetStart, sourceStart, sourceEnd) {
  var length = this._data.length;

  targetStart = Math.max(targetStart || 0, 0);
  sourceStart = Math.max(sourceStart || 0, 0);
  sourceEnd   = Math.min(sourceEnd   || length, length);

  var targetSpace = target.length - targetStart,
      writeLength = Math.min(sourceEnd - sourceStart, targetSpace);

  sourceEnd = sourceStart + writeLength;

  if (targetSpace <= 0) return 0;

  target._data = target._data.substring(0, targetStart) +
                 this._data.substring(sourceStart, sourceEnd) +
                 target._data.substring(targetStart + writeLength, target._data.length);

  return writeLength;
};

['', 'U'].forEach(function(sign) {
  Buffer.prototype['read'  + sign + 'Int8'] = readInt(sign)(1);
  Buffer.prototype['write' + sign + 'Int8'] = writeInt(sign)(1);

  ['BE', 'LE'].forEach(function(endianness) {
    var readStub  = readInt(sign, endianness),
        writeStub = writeInt(sign, endianness);

    [16, 32].forEach(function(size) {
      var method = sign + 'Int' + size + endianness;

      Buffer.prototype['read'  + method] = readStub(size / 8);
      Buffer.prototype['write' + method] = writeStub(size / 8);
    });
  });
});

Buffer.prototype.inspect = function() {
  return '<Buffer ' + this.toString('hex').match(/../g).join(' ') + '>';
};

Buffer.prototype.slice = function(start, end) {
  var length = this._data.length;

  start = start || 0;
  while (start < 0) start += length;

  end = end || length;
  while(end < 0) end += length;

  return new Buffer(this._data.substring(start, end), 'binary');
};

Buffer.prototype.toString = function(encoding) {
  encoding = encoding || 'utf8';
  return ENCODINGS[encoding].encode(this._data);
};

module.exports = {Buffer: Buffer};
