'use strict';

const readInt  = require('./read_int'),
      writeInt = require('./write_int');

const ENCODINGS = {
  base64: require('./base64'),
  binary: require('./binary'),
  hex:    require('./hex'),
  utf8:   require('./utf8')
};

const DEFAULT_ENCODING = 'utf8';

function isArrayLike(object) {
  if (Array.isArray(object)) return true;
  if (object instanceof Uint8Array) return true;
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
    if (typeof data === 'number') this._bytes = new Uint8Array(data);

    if (typeof data === 'string') {
      encoding = encoding || DEFAULT_ENCODING;
      this._bytes = Uint8Array.from(ENCODINGS[encoding].decode(data));
    }

    if (data instanceof Uint8Array) this._bytes = data;
    if (Array.isArray(data)) this._bytes = Uint8Array.from(data);
    if (Buffer.isBuffer(data)) this._bytes = Uint8Array.from(data._bytes);

    this.length = this._bytes.length;
  }

  [Symbol.iterator]() {
    return this._bytes[Symbol.iterator]();
  }

  copy(target, targetStart, sourceStart, sourceEnd) {
    let length = this._bytes.length;

    targetStart = Math.max(targetStart || 0, 0);
    sourceStart = Math.max(sourceStart || 0, 0);
    sourceEnd   = Math.min(sourceEnd   || length, length);

    let sourceLength = sourceEnd - sourceStart,
        targetSpace  = target.length - targetStart,
        writeLength  = Math.min(sourceLength, targetSpace);

    if (targetSpace <= 0) return 0;

    let region = this._bytes.subarray(sourceStart, sourceStart + writeLength);
    target._bytes.set(region, targetStart);

    return writeLength;
  }

  inspect() {
    let bytes = this.toString('hex').match(/../g).join(' ');
    return `<Buffer ${ bytes }>`;
  }

  slice(start, end) {
    let length = this._bytes.length;

    start = start || 0;
    while (start < 0) start += length;

    end = end || length;
    while(end < 0) end += length;

    return Buffer.from(this._bytes.subarray(start, end));
  }

  toString(encoding) {
    encoding = encoding || DEFAULT_ENCODING;
    return ENCODINGS[encoding].encode(this._bytes);
  }
}

['', 'U'].forEach((sign) => {
  Buffer.prototype[`read${sign}Int8`] = readInt(sign)(1);
  Buffer.prototype[`write${sign}Int8`] = writeInt(sign)(1);

  ['BE', 'LE'].forEach((endianness) => {
    let readStub  = readInt(sign, endianness),
        writeStub = writeInt(sign, endianness);

    [16, 32].forEach((size) => {
      let method = sign + 'Int' + size + endianness;

      Buffer.prototype[`read${method}`] = readStub(size / 8);
      Buffer.prototype[`write${method}`] = writeStub(size / 8);
    });
  });
});

module.exports = { Buffer };
