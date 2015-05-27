/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var hotlistUtil = require('../util/hotlist'),
  render = require('../util/htmlRenderer'),
  util = require('../util/util');


exports.task = function(result, config, cb) {

  if (config.html) {
    var limit = 10;

    var assetsBySizeExcludingImages = hotlistUtil.getAssetsBySize(result.assets, limit);
    var largestImages = hotlistUtil.getLargestImages(result.assets, limit);
    var biggestDiffAssets = hotlistUtil.getLargestDiffBetweenLastModAndCache(result.assets, limit);
    var heaviestPages = hotlistUtil.getLargestPages(result.pages, limit);
    var lowestScoringPages = hotlistUtil.getLowestScoringPages(result.pages, limit);
    var slowestAssets = result.assetsByTiming ? hotlistUtil.getSlowestAssets(result.assetsByTiming, limit) : [];
    var worstCachedAssets = hotlistUtil.getWorstCachedAssets(result.assets, limit);


    var slowestDomains = result.domains.sort(function(domain, domain2) {
      return domain2.total.stats.max - domain.total.stats.max;
    });

    slowestDomains = slowestDomains.slice(0, limit < slowestDomains.length ? limit : slowestDomains.length);

    var renderData = {
      'largestImages': largestImages,
      'biggestDiffInTimeAssets': biggestDiffAssets,
      'largestAssets': assetsBySizeExcludingImages,
      'slowestAssets': slowestAssets,
      'slowestDomains': slowestDomains,
      'heaviestPages': heaviestPages,
      'lowestScoringPages': lowestScoringPages,
      'worstCachedAssets': worstCachedAssets,
      'config': config,
      'numberOfPages': result.numberOfAnalyzedPages,
      'pageMeta': {
        'title': 'The hot list page when testing ' + util.getGenericTitle(config),
        'description': 'A quick way to see which pages and assets you need to investigate more.',
        'isHotlist': true
      }
    };
    render('hotlist', renderData, config.run.absResultDir, cb);
  } else {
    cb();
  }
};
