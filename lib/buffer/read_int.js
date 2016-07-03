'use strict';

var FACTORS = require('./factors');

module.exports = function(sign, endianness) {
  var signed = (sign === ''),
      be     = (endianness === 'BE');

  return function(byteLength) {

    return function(offset, noAssert) {
      offset = offset || 0;

      var data = this._data,
          _int = 0,
          _byte;

      if (!noAssert && (offset < 0 || offset + byteLength > data.length))
        throw new RangeError('index out of range');

      for (var i = 0; i < byteLength; i++) {
        _byte = data.charCodeAt(offset + i);
        _int += _byte * FACTORS[be ? byteLength - 1 - i : i];
      }

      if (signed) {
        _byte = data.charCodeAt(be ? offset : offset + byteLength - 1);
        if (_byte >= 0x80) _int -= FACTORS[byteLength];
      }
      return _int;
    };
  };
};
