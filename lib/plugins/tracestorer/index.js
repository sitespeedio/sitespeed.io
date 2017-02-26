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
      // in the future we can get trace logs from WebPageTest
      case 'browsertime.trace':
        {
          this.storageManager.writeDataForUrl(JSON.stringify(message.data, null, 0), message.name, message.url);
        }
    }
  }
};
