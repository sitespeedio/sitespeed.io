/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Aggregator = require('../../aggregator');

module.exports = new Aggregator('redirectsPerPage', 'Redirects Per Page',
  'Avoid doing redirects, it will slow down the page!',
  '', 2,
  function(pageData) {
    if (pageData.yslow) {
      if (pageData.yslow.g.redirects) {
        this.stats.push(pageData.yslow.g.redirects.components.length);
      } else {
        this.stats.push(0);
      }
    }
  });
