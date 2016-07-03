'use strict';

var FACTORS = require('./factors');

module.exports = function(sign, endianness) {
  var signed = (sign === ''),
      be     = (endianness === 'BE');

  return function(byteLength) {

    return function(value, offset, noAssert) {
      offset = offset || 0;

      var data = this._data,
          _low = 0,
          _hi  = FACTORS[byteLength] - 1,
          _str = [];

      if (!noAssert && (offset < 0 || offset + byteLength > data.length))
        throw new RangeError('index out of range');

      if (signed) {
        _low -= FACTORS[byteLength] / 2;
        _hi  -= FACTORS[byteLength] / 2;
      }

      if (value < _low || value > _hi)
        throw new TypeError('value is out of bounds');

      if (signed && value < 0) value += FACTORS[byteLength];

      for (var i = 0; i < byteLength; i++)
        _str[i] = Math.floor(value / FACTORS[be ? byteLength - 1 - i : i]) & 0xFF;

      this._data = data.substring(0, offset) +
                   String.fromCharCode.apply(String, _str) +
                   data.substring(offset + byteLength, data.length);

      return byteLength;
    };
  };
};
