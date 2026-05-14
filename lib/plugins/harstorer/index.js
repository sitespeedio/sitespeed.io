import { Readable } from 'node:stream';
import { createGzip } from 'node:zlib';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

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
      case 'browsertime.har': {
        const json = JSON.stringify(message.data);

        if (this.gzipHAR) {
          // Stream the JSON through gzip straight to disk. The old path
          // materialized json + Buffer.from(json) + the full gzipped Buffer
          // simultaneously, so a 200 MB HAR could peak at several hundred
          // MB of RSS. Now only the JSON string plus gzip's in-flight
          // chunks are alive at any given moment.
          const source = Readable.from([json]).pipe(createGzip({ level: 1 }));
          return this.storageManager.writeDataForUrl(
            source,
            `${message.type}.gz`,
            message.url,
            undefined,
            this.alias[message.url]
          );
        }

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
