'use strict';

module.exports = function(object, field, dflt) {
  let value = object[field];
  return value === undefined ? dflt : value;
};
