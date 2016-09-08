'use strict';

class AssetsBySize {
  constructor(maxSize, asset, page) {
    this.maxSize = maxSize;
    this.items = [];
    this.smallest = asset.contentSize;
    this.add(asset, page);
  }

  add(asset, page) {
    if (asset.contentSize > this.smallest || this.items.length < this.maxSize) {
      // check that the URL doesn't already exists....
      if (!this.items.some(assetInArray => assetInArray.url === asset.url)) {
        this.items.push({
          url: asset.url,
          contentSize: asset.contentSize,
          transferSize: asset.transferSize,
          lastModification: asset.timeSinceLastModified,
          cacheTime: asset.expires,
          page
        });
      }

      if (this.items.length > this.maxSize) {
        this.items.sort(function(asset, asset2) {
          return asset2.contentSize - asset.contentSize;
        });

        if (this.items.length > this.maxSize) {
          this.items.length = this.maxSize;
          this.smallest = this.items[this.maxSize - 1].contentSize;
        }
      }
    }
  }
}

module.exports = {
  assets: {},
  groups: {},
  largestAssets: {},
  largestAssetsByGroup: {},
  addToAggregate(data, group, url, storageManager) {

    var page = storageManager.pathFromRootToPageDir(url);


    if (this.groups[group] === undefined) {
      this.groups[group] = {};
      this.largestAssetsByGroup[group] = {};
    }

    let assets = this.assets;
    let groups = this.groups;
    let largestAssets = this.largestAssets;
    let largestAssetsByGroup = this.largestAssetsByGroup;

    data.assets.forEach(function(asset) {

      if (largestAssets[asset.type]) {
        largestAssets[asset.type].add(asset, page);
      } else {
        largestAssets[asset.type] = new AssetsBySize(10, asset, page);
      }

      if (largestAssetsByGroup[group][asset.type]) {
        largestAssetsByGroup[group][asset.type].add(asset, page);
      } else {
        largestAssetsByGroup[group][asset.type] = new AssetsBySize(10, asset, page);
      }

      const url = asset.url;

      const urlInfo = assets[url] || {
        url: url,
        type: asset.type,
        lastModification: asset.timeSinceLastModified,
        cacheTime: asset.expires,
        size: asset.contentSize,
        page,
        requestCount: 0
      };
      urlInfo.requestCount++;
      assets[url] = urlInfo;

      const urlInfoGroup = groups[group][url] || {
        url: url,
        type: asset.type,
        lastModification: asset.timeSinceLastModified,
        cacheTime: asset.expires,
        size: asset.contentSize,
        page,
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
      },
      size: {
        total: {}
      }
    };

    for (let group of Object.keys(this.groups)) {
      summary.groups[group] = this.groups[group];
      summary.size[group] = {};
      for (let assetTypes of Object.keys(this.largestAssetsByGroup[group])) {
        this.largestAssetsByGroup[group][assetTypes].items.sort(function(asset, asset2) {
          return asset2.contentSize - asset.contentSize;
        });
        summary.size[group][assetTypes] = this.largestAssetsByGroup[group][assetTypes].items;
      }
    }
    for (let assetTypes of Object.keys(this.largestAssets)) {
      this.largestAssets[assetTypes].items.sort(function(asset, asset2) {
        return asset2.contentSize - asset.contentSize;
      });
      summary.size.total[assetTypes] = this.largestAssets[assetTypes].items;
    }
    return summary;
  }
};
