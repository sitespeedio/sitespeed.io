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
  
  getItems() {
    this.items.sort(function(asset, asset2) {
      return asset2.contentSize - asset.contentSize;
    });
    return this.items;
  }
}

module.exports = AssetsBySize;
