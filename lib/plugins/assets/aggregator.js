'use strict';

let AssetsBySize = require('./assetsBySize'),
  AssetsBySpeed = require('./assetsBySpeed');

module.exports = {
  assets: {},
  groups: {},
  largestAssets: {},
  slowestAssets: new AssetsBySpeed(10),
  largestAssetsByGroup: {},
  slowestAssetsByGroup: {},
  addToAggregate(data, group, url, resultUrls) {
    let page = resultUrls.relativeSummaryPageUrl(url);

    // it's a new group
    if (this.groups[group] === undefined) {
      this.groups[group] = {};
      this.largestAssetsByGroup[group] = {};
      this.slowestAssetsByGroup[group] = new AssetsBySpeed(10);
    }

    for (const asset of data.assets) {

      if (this.largestAssets[asset.type]) {
        this.largestAssets[asset.type].add(asset, page);
      } else {
        this.largestAssets[asset.type] = new AssetsBySize(10, asset, page);
      }

      if (this.largestAssetsByGroup[group][asset.type]) {
        this.largestAssetsByGroup[group][asset.type].add(asset, page);
      } else {
        this.largestAssetsByGroup[group][asset.type] = new AssetsBySize(10, asset, page);
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
