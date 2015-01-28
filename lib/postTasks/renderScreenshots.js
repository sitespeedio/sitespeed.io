/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var render = require('../util/htmlRenderer');
exports.task = function(result, config, cb) {
  if (config.screenshot) {
    var renderData = {
      'pages': result.pages,
      'config': config,
      'pageMeta': {
        'title': '',
        'description': '',
        'isScreenshots': true
      }
    };
    render('screenshots', renderData, config.run.absResultDir, cb);
  } else {
    cb();
  }
};
