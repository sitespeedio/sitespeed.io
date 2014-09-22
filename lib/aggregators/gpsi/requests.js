/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Aggregator = require('../../aggregator'),
  log = require('winston');

module.exports = new Aggregator('gpsi.requests', 'Number of requests per page (gpsi)',
  'Fewer requests are always faster than many requests.',
  '', 1,
  function(pageData) {
    if (pageData.gpsi) {
      // seen cases when the number of resources fail, best to be safe
      if (pageData.gpsi.pageStats) {
        this.stats.push(pageData.gpsi.pageStats.numberResources);
      } else {
        log.log('error', 'Non existing pageStats for ' + pageData.gpsi.id);
      }
    }
  });