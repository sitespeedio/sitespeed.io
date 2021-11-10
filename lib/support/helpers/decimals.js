'use strict';

module.exports = function (decimals) {
  let number = Number(decimals).toFixed(3);
  if (number === '0.000') {
    return 0;
  } else return number;
};
