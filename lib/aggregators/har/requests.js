/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Aggregator = require('../../aggregator');

module.exports = new Aggregator('har.requests', 'Number of requests per page (from HAR)',
    'Fewer requests are always faster than many requests.',
    '', 1,
    function (pageData) {
      if (pageData.har) {
        var self = this;
        pageData.har.forEach(function(har) {
          self.stats.push(har.log.entries.length);
        });
      }
  });
