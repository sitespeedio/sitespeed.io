/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Aggregator = require('../../aggregator');

module.exports = new Aggregator('har.pageWeight', 'Total page weight (including all assets) from HAR',
  'The total size is really important because of slow mobile networks, keep the size small.',
  'bytes', 2,
  function(pageData) {
    if (pageData.har) {
      var totalSize = 0;
      pageData.har.forEach(function(har) {
        har.log.entries.forEach(function (entry) {
          totalSize += entry.response.content.size;
        });
      });
      this.stats.push(totalSize);
    }
  });
