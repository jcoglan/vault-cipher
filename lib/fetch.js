'use strict';

module.exports = (object, field, dflt) => {
  let value = object[field];
  return value === undefined ? dflt : value;
};
