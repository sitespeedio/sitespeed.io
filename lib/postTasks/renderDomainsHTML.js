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

  if (config.html && (config.browser || config.wptHost)) {
    var sorted = result.domains.sort(function(domain, domain2) {
      return domain2.count - domain.count;
    });

    if (sorted.length > 200) {
      sorted.length = 200;
    }

    var renderData = {
      'domains': sorted,
      'config': config,
      'numberOfPages': result.numberOfAnalyzedPages,
      'pageMeta': {
        'title': 'The most domain timings testing ' + util.getGenericTitle(config),
        'description': 'A list of the most used domains and the respective timings.',
        'isDomains': true
      }
    };
    render('domains', renderData, config.run.absResultDir, cb);
  } else {
    cb();
  }
};
