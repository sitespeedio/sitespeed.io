'use strict';

module.exports = {
  open(context) {
    this.storageManager = context.storageManager;
  },
  processMessage(message) {
    switch (message.type) {
      case 'browsertime.chrometrace':
      case 'webpagetest.chrometrace': {
        return this.storageManager.writeDataForUrl(
          JSON.stringify(message.data, null, 0),
          message.name,
          message.url,
          '',
          true
        );
      }
    }
  }
};
