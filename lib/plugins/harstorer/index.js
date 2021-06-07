'use strict';

const zlib = require('zlib');
const { promisify } = require('util');
const gzip = promisify(zlib.gzip);

module.exports = {
  open(context, options) {
    this.storageManager = context.storageManager;
    this.gzipHAR = options.gzipHAR;
    this.alias = {};
  },
  processMessage(message) {
    switch (message.type) {
      case 'browsertime.alias': {
        this.alias[message.url] = message.data;
        break;
      }
      case 'browsertime.har':
      case 'webpagetest.har': {
        const json = JSON.stringify(message.data);

        if (this.gzipHAR) {
          return gzip(Buffer.from(json), {
            level: 1
          }).then(gziped =>
            this.storageManager.writeDataForUrl(
              gziped,
              `${message.type}.gz`,
              message.url,
              undefined,

              this.alias[message.url]
            )
          );
        } else {
          return this.storageManager.writeDataForUrl(
            json,
            message.type,
            message.url,
            undefined,
            this.alias[message.url]
          );
        }
      }
    }
  }
};
