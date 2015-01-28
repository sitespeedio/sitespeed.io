/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Aggregator = require('../aggregator');

module.exports = new Aggregator('spofPerPage',
  'Number of SPOF per page',
  'A Single Point Of Failure is a asset that is loaded (usually) from another domain before the page starts rendering, meaning if the asset isn not loaded, the page will be broken/slow.',
  'rule', '', 1,
  function(pageData) {
    if (pageData.yslow) {
      if (pageData.yslow.g.spof) {
        this.stats.push(pageData.yslow.g.spof.components.length);
      } else {
        this.stats.push(0);
      }
    }
  });
