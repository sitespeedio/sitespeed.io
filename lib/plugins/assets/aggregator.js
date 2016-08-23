'use strict';

const getShortUrl = require('../../support/util').getShortUrl,
  getGroup = require('../../support/util').getGroup;

module.exports = {
  assets: {},
  groups: {},
  addToAggregate(data, url) {

    const group = getGroup(url);

    if (this.groups[group] === undefined) {
      this.groups[group] = {};
    }

    let assets = this.assets;
    let groups = this.groups;

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

      const urlInfoGroup = groups[group][url] || {
        url: url,
        shortURL: shortUrl,
        type: asset.type,
        lastModification: asset.timeSinceLastModified,
        cacheTime: asset.expires,
        size: asset.contentSize,
        requestCount: 0
      };

      urlInfoGroup.requestCount++;
      groups[group][url] = urlInfoGroup;

    });
  },
  
  summarize() {
    const summary = {
      groups: {
        total: this.assets
      }
    };
    for (let group of Object.keys(this.groups)) {
      summary.groups[group] = this.groups[group];
    }
    return summary;
  }
};
