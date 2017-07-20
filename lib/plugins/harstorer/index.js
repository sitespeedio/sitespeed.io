'use strict';

const Promise = require('bluebird');
const fs = require('fs');

Promise.promisifyAll(fs);

module.exports = {
  open(context, options) {
    this.storageManager = context.storageManager;
    this.gzipHAR = options.gzipHAR;
  },
  processMessage(message) {
    switch (message.type) {
      case 'browsertime.har':
      case 'webpagetest.har': {
        const jsonData = JSON.stringify(message.data);
        if (this.gzipHAR) {
          return this.storageManager.writeDataForUrl(
            jsonData,
            message.type,
            message.url,
            '',
            true
          );
        } else {
          return this.storageManager.writeDataForUrl(
            jsonData,
            message.type,
            message.url
          );
        }
      }
    }
  }
};
