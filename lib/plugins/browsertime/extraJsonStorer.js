'use strict';

let Promise = require('bluebird'),
  fs = require('fs'),
  forEach = require('lodash.foreach');

Promise.promisifyAll(fs);

module.exports = {
  store(data, url, storageManager) {
    const files = [];
    forEach(data, (value, key) => {
      files.push(storageManager.writeDataForUrl(JSON.stringify(value, null, 0), key, url));
    })
    return Promise.all(files);
  }
};
