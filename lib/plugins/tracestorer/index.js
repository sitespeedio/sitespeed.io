'use strict';

const zlib = require('zlib');
const { promisify } = require('util');
const gzip = promisify(zlib.gzip);

module.exports = {
  open(context) {
    this.storageManager = context.storageManager;
    this.alias = {};
  },
  processMessage(message) {
    switch (message.type) {
      case 'browsertime.alias': {
        this.alias[message.url] = message.data;
        break;
      }
      case 'webpagetest.chrometrace': {
        const json = JSON.stringify(message.data);

        return gzip(Buffer.from(json), { level: 1 }).then(gziped =>
          this.storageManager.writeDataForUrl(
            gziped,
            `${message.name}.gz`,
            message.url,
            undefined,
            this.alias[message.url]
          )
        );
      }
    }
  }
};
