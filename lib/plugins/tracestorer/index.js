import { gzip as _gzip } from 'node:zlib';
import { promisify } from 'node:util';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';
const gzip = promisify(_gzip);

export default class TraceStorerPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'tracestorer', options, context, queue });
  }

  open(context) {
    this.storageManager = context.storageManager;
    this.alias = {};
  }
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
}
