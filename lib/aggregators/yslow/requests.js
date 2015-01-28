/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Aggregator = require('../aggregator');

module.exports = new Aggregator('requests', 'Number of requests per page',
  'Fewer requests are always faster than many requests.',
  'pagemetric', '', 1,
  function(pageData) {
    if (pageData.yslow) {
      this.stats.push(pageData.yslow.r);
    }
  });
