/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
module.exports = {
  getAssetsBySize: function(assets, limit) {

    assets = assets.filter(function(asset) {
      return (asset.type !== 'image' && asset.type !== 'cssimage');
    });

    assets.sort(function(asset, asset2) {
      return asset2.size - asset.size;
    });

    return assets.slice(0, limit < assets.length ? limit : assets.length);

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
    return largestImages.slice(0, limit < largestImages.length ? limit : largestImages.length);

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

    return biggestDiff.slice(0, limit < biggestDiff.length ? limit : biggestDiff.length);

  },

  getWorstCachedAssets: function(assets, limit) {
    assets.sort(function(asset, asset2) {
      return asset.cacheTime - asset2.cacheTime;
    });
    return assets.slice(0, limit < assets.length ? limit : assets.length);
  },

  getLargestPages: function(pages, limit) {

    pages.sort(function(page, thatPage) {

      // if YSlow fails but we collect other data
      // we have the page object but no YSlow
      if (thatPage.yslow && page.yslow) {
        return thatPage.yslow.pageWeight.v - page.yslow.pageWeight.v;
      }
      return 0;
    });
    return pages.slice(0, limit < pages.length ? limit : pages.length);
  },

  getLowestScoringPages: function(pages, limit) {
    pages.sort(function(page, thatPage) {
      return page.score - thatPage.score;
    });

    return pages.slice(0, limit < pages.length ? limit : pages.length);

  },

  getSlowestAssets: function(slowestAssets, limit) {

    slowestAssets.sort(function(asset, thatAsset) {
      return thatAsset.timing.stats.max - asset.timing.stats.max;
    });

    return slowestAssets.slice(0, limit < slowestAssets.length ? limit : slowestAssets.length);
  }


};
