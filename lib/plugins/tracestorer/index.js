'use strict';

const zlib = require('zlib');
const Promise = require('bluebird');

Promise.promisifyAll(zlib);

module.exports = {
  open(context) {
    this.storageManager = context.storageManager;
  },
  processMessage(message) {
    switch (message.type) {
      case 'browsertime.chrometrace':
      case 'webpagetest.chrometrace': {
        const json = JSON.stringify(message.data);

        return zlib
          .gzipAsync(Buffer.from(json), { level: 1 })
          .then(gziped =>
            this.storageManager.writeDataForUrl(
              gziped,
              `${message.name}.gz`,
              message.url
            )
          );
      }
    }
  }
};
