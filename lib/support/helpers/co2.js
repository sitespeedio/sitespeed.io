'use strict';

const kg = 1000;

module.exports = {
  format(grams) {
    if (grams === 0) return '0';
    else if (grams === undefined) return 0;
    else if (grams < kg) {
      return Number(grams).toFixed(4) + ' grams';
    } else {
      return Number(grams / kg).toFixed(3) + ' kg';
    }
  }
};
