'use strict';

let Promise = require('bluebird'),
  fs = require('fs'),
  path = require('path');

Promise.promisifyAll(fs);

function shouldIgnoreMessage(message) {
  return ['url', 'error', 'summarize','browsertime.screenshot', 'browsertime.har', 'webpagetest.har'].indexOf(message.type) >= 0;
}

module.exports = {
  name() {
    return path.basename(__dirname);
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
      return this.storageManager.writeDataForUrl(jsonData, fileName, message.url);
    } else {
      return this.storageManager.writeData(fileName, jsonData);
    }
  }
};
