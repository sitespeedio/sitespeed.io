'use strict';

class AssetsBySpeed {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.items = [];
    this.timing = 0;
  }

  add(asset, page, runPage) {
    const totalTime =
      asset.timings.blocked +
      asset.timings.dns +
      asset.timings.connect +
      asset.timings.send +
      asset.timings.wait +
      asset.timings.receive;
    if (totalTime > this.totalTime || this.items.length < this.maxSize) {
      // TODO if this one is slower than an already existing item, replace that!
      if (!this.items.some(assetInArray => assetInArray.url === asset.url)) {
        this.items.push({
          url: asset.url,
          contentSize: asset.contentSize,
          transferSize: asset.transferSize,
          lastModification: asset.timeSinceLastModified,
          cacheTime: asset.expires,
          timings: asset.timings,
          totalTime: totalTime,
          page,
          runPage
        });
      }

      if (this.items.length > this.maxSize) {
        this.items.sort(function (asset, asset2) {
          return asset2.totalTime - asset.totalTime;
        });

        if (this.items.length > this.maxSize) {
          this.items.length = this.maxSize;
          this.totalTime = this.items[this.maxSize - 1].totalTime;
        }
      }
    }
  }

  getItems() {
    this.items.sort(function (asset, asset2) {
      return asset2.totalTime - asset.totalTime;
    });

    return this.items;
  }
}

module.exports = AssetsBySpeed;
