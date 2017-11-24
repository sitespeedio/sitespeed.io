'use strict';

const Promise = require('bluebird');
const zlib = require('zlib');

Promise.promisifyAll(zlib);

module.exports = {
  open(context, options) {
    this.storageManager = context.storageManager;
    this.gzipHAR = options.gzipHAR;
  },
  processMessage(message) {
    switch (message.type) {
      case 'browsertime.har':
      case 'webpagetest.har': {
        const json = JSON.stringify(message.data);

        if (this.gzipHAR) {
          return zlib
            .gzipAsync(Buffer.from(json), { level: 1 })
            .then(gziped =>
              this.storageManager.writeDataForUrl(
                gziped,
                `${message.type}.gz`,
                message.url
              )
            );
        } else {
          return this.storageManager.writeDataForUrl(
            json,
            message.type,
            message.url
          );
        }
      }
    }
  }
};
