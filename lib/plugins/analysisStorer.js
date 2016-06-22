'use strict';

let Promise = require('bluebird'),
  fs = require('fs'),
  path = require('path');

Promise.promisifyAll(fs);

function shouldIgnoreMessage(message) {
  return ['url', 'error', 'summarize','browsertime.screenshot'].indexOf(message.type) >= 0;
}

module.exports = {
  name() {
    return path.basename(__filename, '.js');
  },
  open(context) {
    this.storageManager = context.storageManager;
  },
  processMessage(message) {
    if (shouldIgnoreMessage(message)) {
      return;
    }

    const jsonData = JSON.stringify(message.data);

    let fileName = message.type + '.json';
    if (Number.isInteger(message.runIndex)) {
      fileName = message.type + '-' + message.runIndex + '.json';
    }

    if (message.url) {
      return this.storageManager.writeDataForUrl(message.url, fileName, jsonData);
    } else {
      return this.storageManager.writeData(fileName, jsonData);
    }
  }
};
