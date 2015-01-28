/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var Aggregator = require('../aggregator');

module.exports = new Aggregator('redirectsPerPage', 'Redirects Per Page',
  'Avoid doing redirects, it will slow down the page!',
  'pagemetric', '', 2,
  function(pageData) {
    if (pageData.yslow) {
      if (pageData.yslow.g.redirects) {
        // push the actually value
        this.stats.push(Number(pageData.yslow.g.redirects
          .components[0]));
      } else {
        this.stats.push(0);
      }
    }
  });
