'use strict';
const get = require('lodash.get');

module.exports = function (object, property, defaultValue) {
  if (arguments.length < 3) {
    defaultValue = 0;
  }
  if (!object) {
    return defaultValue;
  }
  return get(object, property, defaultValue);
};
