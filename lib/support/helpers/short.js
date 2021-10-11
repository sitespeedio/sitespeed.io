'use strict';

module.exports = function (text, number) {
  if (text.length > number) {
    return text.slice(0, number) + '...';
  }
  return text;
};
