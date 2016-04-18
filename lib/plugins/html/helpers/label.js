'use strict';

module.exports = function(value, ok, warning) {
  if (value > ok) {
    return 'ok';
  }
  else if (value > warning) {
    return 'warning';
  }
  return 'error';
};
