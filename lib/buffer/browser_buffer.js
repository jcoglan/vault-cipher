'use strict';

var ENCODERS = {
  base64: require('./base64'),
  binary: require('./binary'),
  hex:    require('./hex'),
  utf8:   require('./utf8')
};

var Uint8Array = window.Uint8Array;

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
    data = ENCODERS[encoding].decode(data);
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
  return ENCODERS[encoding].encode(this._data);
};

module.exports = {Buffer: Buffer};
