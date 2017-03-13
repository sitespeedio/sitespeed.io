'use strict';

const Promise = require('bluebird');
const fs = require('fs');

Promise.promisifyAll(fs);

module.exports = {
  open(context) {
    this.storageManager = context.storageManager;
  },
  processMessage(message) {
    switch (message.type) {
      case 'browsertime.har':
      case 'webpagetest.har':
        {
          const jsonData = JSON.stringify(message.data);
          return this.storageManager.writeDataForUrl(jsonData, message.type, message.url);

        }
    }
  }
};
