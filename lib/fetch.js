'use strict';

module.exports = function(object, field, dflt) {
  var value = object[field];
  return value === undefined ? dflt : value;
};
