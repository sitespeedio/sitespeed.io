'use strict';

let AssetsBySize = require('./assetsBySize'),
  get = require('lodash.get'),
  AssetsBySpeed = require('./assetsBySpeed');

module.exports = {
  assets: {},
  groups: {},
  largestAssets: {},
  largestAssetsByGroup: {},
  slowestAssetsByGroup: {},
  addToAggregate(data, group, url, resultUrls, options) {

    const maxSize = get(options, 'html.topListSize', 10);
    let page = resultUrls.relativeSummaryPageUrl(url);

    if (!this.slowestAssets) {
      this.slowestAssets = new AssetsBySpeed(maxSize);
    }

    // it's a new group
    if (this.groups[group] === undefined) {
      this.groups[group] = {};
      this.largestAssetsByGroup[group] = {};
      this.slowestAssetsByGroup[group] = new AssetsBySpeed(maxSize);
    }

    for (const asset of data.assets) {

      if (this.largestAssets[asset.type]) {
        this.largestAssets[asset.type].add(asset, page);
      } else {
        this.largestAssets[asset.type] = new AssetsBySize(maxSize , asset, page);
      }

      if (this.largestAssetsByGroup[group][asset.type]) {
        this.largestAssetsByGroup[group][asset.type].add(asset, page);
      } else {
        this.largestAssetsByGroup[group][asset.type] = new AssetsBySize(maxSize, asset, page);
      }

      this.slowestAssets.add(asset, page);
      this.slowestAssetsByGroup[group].add(asset, page);

      const url = asset.url;

      const urlInfo = this.assets[url] || {
        url: url,
        type: asset.type,
        lastModification: asset.timeSinceLastModified,
        cacheTime: asset.expires,
        size: asset.contentSize,
        page,
        timing: asset.timing,
        requestCount: 0
      };
      urlInfo.requestCount++;
      this.assets[url] = urlInfo;

      const urlInfoGroup = this.groups[group][url] || {
        url: url,
        type: asset.type,
        lastModification: asset.timeSinceLastModified,
        cacheTime: asset.expires,
        size: asset.contentSize,
        page,
        timing: asset.timing,
        requestCount: 0
      };

      urlInfoGroup.requestCount++;
      this.groups[group][url] = urlInfoGroup;
    }

  },

  summarize() {
    const summary = {
      groups: {
        total: this.assets
      },
      size: {
        total: {}
      },
      timing: {
        total: {}
      }
    };

    for (let group of Object.keys(this.groups)) {
      summary.groups[group] = this.groups[group];
      summary.size[group] = {};
      summary.timing[group] = {};
      for (let assetTypes of Object.keys(this.largestAssetsByGroup[group])) {
        summary.size[group][assetTypes] = this.largestAssetsByGroup[group][assetTypes].getItems();
      }
      summary.timing[group] = this.slowestAssetsByGroup[group].getItems();
    }

    for (let assetTypes of Object.keys(this.largestAssets)) {
      summary.size.total[assetTypes] = this.largestAssets[assetTypes].getItems();
    }

    summary.timing.total = this.slowestAssets.getItems();

    return summary;
  }
};
