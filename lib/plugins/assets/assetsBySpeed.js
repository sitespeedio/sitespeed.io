'use strict';

class AssetsBySpeed {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.items = [];
    this.timing = 0;
  }

  add(asset, page, runPage) {
    if (asset.timing > this.timing || this.items.length < this.maxSize) {
      // TODO if this one is slower than an already existing item, replace that!
      if (!this.items.some(assetInArray => assetInArray.url === asset.url)) {
        this.items.push({
          url: asset.url,
          contentSize: asset.contentSize,
          transferSize: asset.transferSize,
          lastModification: asset.timeSinceLastModified,
          cacheTime: asset.expires,
          timing: asset.timing,
          page,
          runPage
        });
      }

      if (this.items.length > this.maxSize) {
        this.items.sort(function(asset, asset2) {
          return asset2.timing - asset.timing;
        });

        if (this.items.length > this.maxSize) {
          this.items.length = this.maxSize;
          this.timing = this.items[this.maxSize - 1].timing;
        }
      }
    }
  }

  getItems() {
    this.items.sort(function(asset, asset2) {
      return asset2.timing - asset.timing;
    });

    return this.items;
  }
}

module.exports = AssetsBySpeed;
