'use strict';

let Promise = require('bluebird'),
  fs = require('fs'),
  path = require('path');

Promise.promisifyAll(fs);

module.exports = {
  name() {
    return path.basename(__filename, '.js');
  },
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
