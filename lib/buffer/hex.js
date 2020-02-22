'use strict';

module.exports = {
  decode(string) {
    let data = [];
    for (let i = 0, n = string.length; i < n; i += 2) {
      let chunk = string.substr(i, 2);
      if (!/[0-9a-f]{2}/i.test(chunk)) throw new TypeError('Invalid hex string');
      data[i / 2] = parseInt(string.substr(i, 2), 16);
    }
    return String.fromCharCode.apply(String, data);
  },

  encode(data) {
    let string = '';
    for (let i = 0, n = data.length; i < n; i++) {
      let block = data.charCodeAt(i).toString(16);

      if (block.length === 1) block = '0' + block;

      if (block.length > 2)
        throw new Error('Hex encoding error: Found value ' + block + ' at offset ' + i);

      string += block;
    }
    return string;
  }
};
