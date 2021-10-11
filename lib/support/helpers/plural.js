'use strict';

module.exports = function (number, text) {
  if (number === 0 || number > 1) {
    text += 's';
  }
  return '' + number + ' ' + text;
};
