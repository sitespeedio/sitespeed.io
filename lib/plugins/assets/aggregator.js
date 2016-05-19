'use strict';

const assets = {};

module.exports = {
  addToAggregate(data) {
    data.assets.forEach(function(asset) {
      const url = asset.url;
      const urlInfo = assets[url] || {
          url: url,
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
