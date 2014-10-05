module.exports = {
  getAssetsBySize: function(assets, limit) {
    assets.sort(function(asset, asset2) {
      return asset2.size - asset.size;
    });

    if (assets.length > limit) {
      assets.length = limit;
    }
    return assets;
  },

  getLargestImages: function(assets, limit) {
    var largestImages = assets.filter(function(asset) {
      return (asset.type === 'image' || asset.type === 'cssimage');
    });

    largestImages.sort(function(asset, asset2) {
      return asset2.size - asset.size;
    });

    if (largestImages.length > limit) {
      largestImages.length = limit;
    }
    return largestImages;
  },
  getLargestDiffBetweenLastModAndCache: function(assets, limit) {
    // sometimes the last mod is -1 if it is not set by the server
    var biggestDiff = assets.filter(function(asset) {
      return asset.timeSinceLastModification !== -1;
    });

    biggestDiff.sort(function(asset, asset2) {
      var diff = asset.cacheTime - asset.timeSinceLastModification;
      var diff2 = asset2.cacheTime - asset2.timeSinceLastModification;

      return diff - diff2;
    });

    if (biggestDiff.length > limit) {
      biggestDiff.length = limit;
    }
    return biggestDiff;
  },
  getLargestPages: function(pages, limit) {
    pages.sort(function(page, thatPage) {
      return thatPage.yslow.pageWeight.v - page.yslow.pageWeight.v;
    });

    if (pages.length > limit) {
      pages.length = limit;
    }
    return pages;

  },

  getLowestScoringPages: function(pages, limit) {
    pages.sort(function(page, thatPage) {
      return page.score - thatPage.score;
    });

    if (pages.length > limit) {
      pages.length = limit;
    }

    return pages;
  }


};