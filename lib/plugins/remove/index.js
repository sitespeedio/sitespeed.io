'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.remove');

module.exports = {
  open(context, options) {
    this.storageManager = context.storageManager;
    this.options = options;
  },
  async processMessage(message) {
    switch (message.type) {
      case 'remove.url': {
        log.info('Remove data for URL %s', message.url);
        await this.storageManager.removeDataForUrl(message.url);
        break;
      }
    }
  }
};
