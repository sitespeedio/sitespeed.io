/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var render = require('../util/htmlRenderer'),
util = require('../util/util');

exports.task = function(result, config, cb) {

  if (config.html) {
    var sorted = result.assets.sort(function(asset, asset2) {
      return asset2.count - asset.count;
    });

    var renderData = {
      'assets': sorted.length > 200 ? sorted.slice(0, 200) : sorted,
      'config': config,
      'numberOfPages': result.numberOfAnalyzedPages,
      'pageMeta': {
        'title': 'The most used assets when testing ' + util.getGenericTitle(config),
        'description': 'A list of the most used assets for the analyzed pages.',
        'isAssets': true
      }
    };
    render('assets', renderData, config.run.absResultDir, cb);
  }
  else {
    cb();
  }
};
