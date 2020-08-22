'use strict';

const KB = 1024,
  MB = 1024 * 1024;

module.exports = {
  asKb(bytes) {
    if (!bytes || bytes < 0) return 0;
    return Number(bytes / KB).toFixed(1);
  },
  format(bytes) {
    if (bytes === 0) return '0 b';
    if (!bytes || bytes < 0 || bytes === 'N/A') return 'N/A';

    if (bytes < KB) {
      return Number(bytes) + ' B';
    } else if (bytes < MB) {
      return Number(bytes / KB).toFixed(1) + ' KB';
    } else {
      return Number(bytes / MB).toFixed(1) + ' MB';
    }
  }
};
