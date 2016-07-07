'use strict';

const getShortUrl = require('../../support/util').getShortUrl;

const assets = {};

module.exports = {
  addToAggregate(data) {
    data.assets.forEach(function(asset) {
      const url = asset.url,
      shortUrl = getShortUrl(asset.url);
      const urlInfo = assets[url] || {
          url: url,
          shortURL: shortUrl,
          type: asset.type,
          lastModification: asset.timeSinceLastModified,
          cacheTime: asset.expires,
          size: asset.contentSize,
          requestCount: 0
        };
      urlInfo.requestCount++;
      assets[url] = urlInfo;
    });
  },
  summarize() {
    return assets;
  }
};
