/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var toplistUtil = require('../util/toplist'),
  render = require('../util/htmlRenderer'),
  util = require('../util/util');


exports.task = function(result, config, cb) {

  var limit = 10;

  var assetsBySizeExcludingImages = toplistUtil.getAssetsBySize(result.assets, limit);
  var largestImages = toplistUtil.getLargestImages(result.assets, limit);
  var biggestDiffAssets = toplistUtil.getLargestDiffBetweenLastModAndCache(result.assets, limit);
  var heaviestPages = toplistUtil.getLargestPages(result.pages, limit);
  var lowestScoringPages = toplistUtil.getLowestScoringPages(result.pages, limit);

  util.sortWithMaxLength(result.domains, function(domain, domain2) {
    return domain2.total.stats.max - domain.total.stats.max;
  }, limit);

  var renderData = {
    'largestImages': largestImages,
    'worstCachedAssets': biggestDiffAssets,
    'largestAssets': assetsBySizeExcludingImages,
    // TODO 'slowestAssets': [],
    'slowestDomains': result.domains,
    'heaviestPages': heaviestPages,
    'lowestScoringPages': lowestScoringPages,
    'config': config,
    'numberOfPages': result.numberOfAnalyzedPages,
    'pageMeta': {
      'title': 'The top list page',
      'description': 'A quick way to see which pages and assets are the worst',
      'isToplist': true
    }
  };
  render('toplist', renderData, config.run.absResultDir, cb);
};