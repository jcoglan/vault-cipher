'use strict';

const FACTORS = require('./factors');

module.exports = (sign, endianness) => {
  let signed = (sign === ''),
      be     = (endianness === 'BE');

  return (byteLength) => {
    return function(value, offset, noAssert) {
      offset = offset || 0;

      let bytes = this._bytes,
          low   = 0,
          high  = FACTORS[byteLength] - 1;

      if (!noAssert && (offset < 0 || offset + byteLength > bytes.length))
        throw new RangeError('index out of range');

      if (signed) {
        low  -= FACTORS[byteLength] / 2;
        high -= FACTORS[byteLength] / 2;
      }

      if (value < low || value > high)
        throw new TypeError('value is out of bounds');

      if (signed && value < 0) value += FACTORS[byteLength];

      for (let i = 0; i < byteLength; i++) {
        let _byte = Math.floor(value / FACTORS[be ? byteLength - 1 - i : i]);
        bytes[offset + i] = _byte & 0xFF;
      }

      return byteLength;
    };
  };
};
