'use strict';

module.exports = {
  decode(string) {
    return Array.from(string).map((c) => c.charCodeAt(0));
  },

  encode(bytes) {
    return String.fromCharCode.apply(String, bytes);
  }
};
