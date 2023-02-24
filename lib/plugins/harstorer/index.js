import { gzip as _gzip } from 'node:zlib';
import { promisify } from 'node:util';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';
const gzip = promisify(_gzip);

export default class HarstorerPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'harstorer', options, context, queue });
  }

  open(context, options) {
    this.storageManager = context.storageManager;
    this.gzipHAR = options.gzipHAR;
    this.alias = {};
  }

  processMessage(message) {
    switch (message.type) {
      case 'browsertime.alias': {
        this.alias[message.url] = message.data;
        break;
      }
      case 'browsertime.har':
      case 'webpagetest.har': {
        const json = JSON.stringify(message.data);

        return this.gzipHAR
          ? gzip(Buffer.from(json), {
              level: 1
            }).then(gziped =>
              this.storageManager.writeDataForUrl(
                gziped,
                `${message.type}.gz`,
                message.url,
                undefined,

                this.alias[message.url]
              )
            )
          : this.storageManager.writeDataForUrl(
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
