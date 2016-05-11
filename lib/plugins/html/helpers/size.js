'use strict';

const KB = 1024, MB = 1024 * 1024;

module.exports = {
  asKb(bytes) {
    if (!bytes || bytes < 0)
      return '';

    return Number(bytes / KB).toFixed(1);
  },
  format(bytes) {
    if (!bytes || bytes < 0)
      return '';

    if (bytes < KB) {
      return Number(bytes) + ' b';
    } else if (bytes < MB) {
      return Number(bytes / KB).toFixed(1) + ' kb';
    } else {
      return Number(bytes / MB).toFixed(1) + ' Mb';
    }
  }
};
