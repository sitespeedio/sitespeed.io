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
  largestThirdPartyAssetsByGroup: {},
  slowestThirdPartyAssetsByGroup: {},
  addToAggregate(data, group, url, resultUrls, runIndex, options, alias) {
    const maxSize = get(options, 'html.topListSize', 10);
    let page = resultUrls.relativeSummaryPageUrl(url, alias[url]);
    let runPage = page + runIndex;

    if (!this.slowestAssets) {
      this.slowestAssets = new AssetsBySpeed(maxSize);
      this.slowestAssetsThirdParty = new AssetsBySpeed(maxSize);
      this.largestAssetsThirdParty = new AssetsBySize(maxSize);
    }
    // it's a new group
    if (this.groups[group] === undefined) {
      this.groups[group] = {};
      this.largestAssetsByGroup[group] = {};
      this.largestThirdPartyAssetsByGroup[group] = new AssetsBySize(maxSize);
      this.slowestAssetsByGroup[group] = new AssetsBySpeed(maxSize);
      this.slowestThirdPartyAssetsByGroup[group] = new AssetsBySpeed(maxSize);
    }

    for (const asset of data.assets) {
      if (this.largestAssets[asset.type]) {
        this.largestAssets[asset.type].add(asset, page, runPage);
      } else {
        this.largestAssets[asset.type] = new AssetsBySize(maxSize);
        this.largestAssets[asset.type].add(asset, page, runPage);
      }

      if (this.largestAssetsByGroup[group][asset.type]) {
        this.largestAssetsByGroup[group][asset.type].add(asset, page, runPage);
      } else {
        this.largestAssetsByGroup[group][asset.type] = new AssetsBySize(
          maxSize
        );
        this.largestAssetsByGroup[group][asset.type].add(asset, page, runPage);
      }

      this.slowestAssets.add(asset, page, runPage);
      this.slowestAssetsByGroup[group].add(asset, page, runPage);

      const url = asset.url;

      if (options.firstParty) {
        if (!url.match(options.firstParty)) {
          this.slowestAssetsThirdParty.add(asset, page, runPage);
          this.largestAssetsThirdParty.add(asset, page, runPage);
          this.slowestThirdPartyAssetsByGroup[group].add(asset, page, runPage);
          this.largestThirdPartyAssetsByGroup[group].add(asset, page, runPage);
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
        timings: asset.timings,
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
        timings: asset.timings,
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
        thirdParty: this.largestAssetsThirdParty
          ? this.largestAssetsThirdParty.getItems()
          : {}
      },
      timing: {
        total: {},
        thirdParty: this.slowestAssetsThirdParty
          ? this.slowestAssetsThirdParty.getItems()
          : {}
      }
    };

    for (let group of Object.keys(this.groups)) {
      summary.groups[group] = this.groups[group];
      summary.size[group] = {};
      summary.timing[group] = {};
      for (let assetTypes of Object.keys(this.largestAssetsByGroup[group])) {
        summary.size[group][assetTypes] =
          this.largestAssetsByGroup[group][assetTypes].getItems();
      }
      summary.timing[group] = this.slowestAssetsByGroup[group].getItems();
    }

    for (let assetTypes of Object.keys(this.largestAssets)) {
      summary.size.total[assetTypes] =
        this.largestAssets[assetTypes].getItems();
    }

    summary.timing.total = this.slowestAssets
      ? this.slowestAssets.getItems()
      : {};

    return summary;
  }
};
