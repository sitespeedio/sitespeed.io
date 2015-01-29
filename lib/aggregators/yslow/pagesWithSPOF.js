/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var Aggregator = require('../aggregator');

module.exports = new Aggregator('pagesWithSPOF', 'Pages with SPOF',
  'How many pages have a single point of failures (meaning if someone else\'s API/site is broken, it will break your page.',
  'rule', '', 1,
  function(pageData) {
    if (pageData.yslow) {
      if (pageData.yslow.g.spof) {
        this.stats.push(1);
      } else {
        this.stats.push(0);
      }
    }
  });
