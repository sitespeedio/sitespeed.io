'use strict';

module.exports = {
  assets: {},
  addToAggregate(data) {
    var assets = this.assets;
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
      urlInfo.requestCount += 1;
      assets[url] = urlInfo;
    });
  },
  summarize() {
    const urls = Object.keys(this.assets);
    return urls.map((url) => this.assets[url]);
  }
};
