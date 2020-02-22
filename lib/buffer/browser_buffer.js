'use strict';

const readInt  = require('./read_int'),
      writeInt = require('./write_int');

const ENCODINGS = {
  base64: require('./base64'),
  binary: require('./binary'),
  hex:    require('./hex'),
  utf8:   require('./utf8')
};

const Uint8Array = global.Uint8Array;

function isArrayLike(object) {
  if (Array.isArray(object)) return true;
  if (Uint8Array && object instanceof Uint8Array) return true;
  return false;
}

class Buffer {
  static alloc(size) {
    if (typeof size === 'number')
      return new Buffer(size);
    else
      throw new TypeError('The "size" argument must be of type number.');
  }

  static from(data, encoding) {
    if (typeof data === 'string' || Buffer.isBuffer(data) || isArrayLike(data))
      return new Buffer(data, encoding);
    else
      throw new TypeError('The first argument must be of type string or an instance of Buffer or Array.');
  }

  static concat(list, totalLength) {
    if (typeof totalLength !== 'number') {
      totalLength = 0;
      for (let i = 0, n = list.length; i < n; i++) {
        totalLength += list[i].length;
      }
    }

    let buffer = Buffer.alloc(totalLength),
        offset = 0;

    for (let i = 0, n = list.length; i < n; i++) {
      list[i].copy(buffer, offset);
      offset += list[i].length;
    }
    return buffer;
  }

  static isBuffer(object) {
    return object instanceof Buffer;
  }

  constructor(data, encoding) {
    if (Buffer.isBuffer(data)) {
      data = data._data;
    } else if (isArrayLike(data)) {
      data = String.fromCharCode.apply(String, data);
    } else if (typeof data === 'number') {
      data = String.fromCharCode.apply(String, Array(data));
    } else if (typeof data === 'string') {
      encoding = encoding || 'utf8';
      data = ENCODINGS[encoding].decode(data);
    }
    this._data  = data;
    this.length = data.length;
  }

  copy(target, targetStart, sourceStart, sourceEnd) {
    let length = this._data.length;

    targetStart = Math.max(targetStart || 0, 0);
    sourceStart = Math.max(sourceStart || 0, 0);
    sourceEnd   = Math.min(sourceEnd   || length, length);

    let targetSpace = target.length - targetStart,
        writeLength = Math.min(sourceEnd - sourceStart, targetSpace);

    sourceEnd = sourceStart + writeLength;

    if (targetSpace <= 0) return 0;

    target._data = target._data.substring(0, targetStart) +
                   this._data.substring(sourceStart, sourceEnd) +
                   target._data.substring(targetStart + writeLength, target._data.length);

    return writeLength;
  }

  inspect() {
    return '<Buffer ' + this.toString('hex').match(/../g).join(' ') + '>';
  }

  slice(start, end) {
    let length = this._data.length;

    start = start || 0;
    while (start < 0) start += length;

    end = end || length;
    while(end < 0) end += length;

    return Buffer.from(this._data.substring(start, end), 'binary');
  }

  toString(encoding) {
    encoding = encoding || 'utf8';
    return ENCODINGS[encoding].encode(this._data);
  }
}

['', 'U'].forEach((sign) => {
  Buffer.prototype['read'  + sign + 'Int8'] = readInt(sign)(1);
  Buffer.prototype['write' + sign + 'Int8'] = writeInt(sign)(1);

  ['BE', 'LE'].forEach((endianness) => {
    let readStub  = readInt(sign, endianness),
        writeStub = writeInt(sign, endianness);

    [16, 32].forEach((size) => {
      let method = sign + 'Int' + size + endianness;

      Buffer.prototype['read'  + method] = readStub(size / 8);
      Buffer.prototype['write' + method] = writeStub(size / 8);
    });
  });
});

module.exports = { Buffer: Buffer };
