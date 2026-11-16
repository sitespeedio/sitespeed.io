import { getLogger } from '@sitespeed.io/log';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

const log = getLogger('sitespeedio.plugin.remove');

export default class RemovePlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'remove', options, context, queue });
  }
  open(context, options) {
    this.storageManager = context.storageManager;
    this.options = options;
  }
  async processMessage(message) {
    switch (message.type) {
      case 'remove.url': {
        log.info('Remove data for URL %s', message.url);
        await this.storageManager.removeDataForUrl(message.url);
        break;
      }
    }
  }
}
