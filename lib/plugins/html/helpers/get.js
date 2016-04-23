'use strict';

module.exports = function(object, property, defaultValue) {
  if (arguments.length < 3) {
    defaultValue = 0;
  }
  if (!object) {
    return defaultValue;
  }
  const value = object[property];
  return value || defaultValue;
};
