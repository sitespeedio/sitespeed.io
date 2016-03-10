'use strict';

const moment = require('moment');

const httpDateFormat = 'ddd, D MMM YYYY H:mm:ss Z';

function findHeader(name, headers) {
  name = name.toLowerCase();
  return headers.find((h) => h.name.toLowerCase() === name);
}

function getType(entry) {
  return entry.response.content.mimeType;
}

function isRedirect(asset) {
  const status = asset.response.status;
  return (status >= 300 && status < 400 && status !== 304);
}

const cacheTimeRegex = /max-age=(\d+)/i;

function getCacheTime(entry) {
  const header = findHeader('Cache-Control', entry.response.headers);

  if (header) {
    const time = cacheTimeRegex.exec(header.value);

    if (time)
      return Number(time[1]);
  }

  return undefined;
}

function getLastModification(entry) {
  const header = findHeader('Last-Modified', entry.response.headers);

  if (header) {
    const date = moment(header.value, httpDateFormat);
    if (date.isValid()) {
      return date.format();
    }
  }

  return undefined;
}

function getSize(entry) {
  return entry.response.bodySize;
}

module.exports = {
  assets: {},
  addToAggregate(har) {
    this.assets = har.log.entries.reduce((assets, entry) => {
      if (isRedirect(entry))
        return assets;

      const url = entry.request.url;
      const urlInfo = assets[url] || {
          url: url,
          type: getType(entry),
          lastModification: getLastModification(entry),
          cacheTime: getCacheTime(entry),
          size: getSize(entry),
          requestCount: 0
        };
      urlInfo.requestCount += 1;
      assets[url] = urlInfo;
      return assets;
    }, this.assets);
  },
  summarize() {
    const urls = Object.keys(this.assets);
    return urls.map((url) => this.assets[url]);
  }
};
