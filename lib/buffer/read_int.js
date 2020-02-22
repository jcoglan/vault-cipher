'use strict';

const FACTORS = require('./factors');

module.exports = (sign, endianness) => {
  let signed = (sign === ''),
      be     = (endianness === 'BE');

  return (byteLength) => {
    return function(offset, noAssert) {
      offset = offset || 0;

      let data = this._data,
          _int = 0;

      if (!noAssert && (offset < 0 || offset + byteLength > data.length))
        throw new RangeError('index out of range');

      for (let i = 0; i < byteLength; i++) {
        let _byte = data.charCodeAt(offset + i);
        _int += _byte * FACTORS[be ? byteLength - 1 - i : i];
      }

      if (signed) {
        let _byte = data.charCodeAt(be ? offset : offset + byteLength - 1);
        if (_byte >= 0x80) _int -= FACTORS[byteLength];
      }
      return _int;
    };
  };
};
