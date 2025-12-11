import { messageMaker } from '../support/messageMaker.js';
const make = messageMaker('url-reader').make;

export function findUrls(queue, options) {
  for (const url of options.urls) {
    queue.postMessage(
      make(
        'url',
        {},
        {
          url: url,
          group:
            options.urlsMetaData &&
            options.urlsMetaData[url] &&
            options.urlsMetaData[url].groupAlias
              ? options.urlsMetaData[url].groupAlias
              : new URL(url).hostname
        }
      )
    );
  }
}
