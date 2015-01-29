/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Aggregator = require('../aggregator');

module.exports = new Aggregator('criticalPathScore',
  'Critical Rendering Path Score',
  'Do as little as possible within the HEAD tag so that the browser can start rendering a page as soon as possible (avoid DNS lookups and load CSS/JS files).',
  'rule', '', 1,
  function(pageData) {
    if (pageData.yslow) {
      if (pageData.yslow.g.criticalpath) {
        this.stats.push(pageData.yslow.g.criticalpath.score);
      }
    }
  });
