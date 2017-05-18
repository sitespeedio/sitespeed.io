'use strict';

let AssetsBySize = require('./assetsBySize'),
  AssetsBySpeed = require('./assetsBySpeed');

module.exports = {
  assets: {},
  groups: {},
  largestAssets: {},
  slowestAssets: new AssetsBySpeed(10),
  slowestAssetsThirdParty: new AssetsBySpeed(10),
  largestAssetsThirdParty: new AssetsBySize(10),
  largestAssetsByGroup: {},
  slowestAssetsByGroup: {},
  addToAggregate(data, group, url, resultUrls, runIndex, options) {
    let page = resultUrls.relativeSummaryPageUrl(url);
    let runPage = page + runIndex;
    // it's a new group
    if (this.groups[group] === undefined) {
      this.groups[group] = {};
      this.largestAssetsByGroup[group] = {};
      this.slowestAssetsByGroup[group] = new AssetsBySpeed(10);
    }

    for (const asset of data.assets) {

      if (this.largestAssets[asset.type]) {
        this.largestAssets[asset.type].add(asset, page, runPage);
      } else {
        this.largestAssets[asset.type] = new AssetsBySize(10);
        this.largestAssets[asset.type].add(asset, page, runPage);
      }

      if (this.largestAssetsByGroup[group][asset.type]) {
        this.largestAssetsByGroup[group][asset.type].add(asset, page, runPage);
      } else {
        this.largestAssetsByGroup[group][asset.type] = new AssetsBySize(10);
        this.largestAssetsByGroup[group][asset.type].add(asset, page, runPage);
      }

      this.slowestAssets.add(asset, page, runPage);
      this.slowestAssetsByGroup[group].add(asset, page, runPage);

      const url = asset.url;

      if (options.firstParty) {
        if (!url.match(options.firstParty)) {
          this.slowestAssetsThirdParty.add(asset, page, runPage);
          this.largestAssetsThirdParty.add(asset, page, runPage);
        }
      }

      const urlInfo = this.assets[url] || {
        url: url,
        type: asset.type,
        lastModification: asset.timeSinceLastModified,
        cacheTime: asset.expires,
        size: asset.contentSize,
        page,
        runPage,
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
        runPage,
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
        total: {},
        thirdParty: this.largestAssetsThirdParty.getItems()
      },
      timing: {
        total: {},
        thirdParty: this.slowestAssetsThirdParty.getItems()
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
