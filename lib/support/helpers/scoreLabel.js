'use strict';

module.exports = function (value) {
  value = value || 0;
  if (value > 90) {
    return 'ok';
  } else if (value > 80) {
    return 'warning';
  }
  return 'error';
};
