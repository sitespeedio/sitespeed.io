/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Aggregator = require('../../aggregator');

module.exports = new Aggregator('wpt.firstViewRequests',
  'Requests First View',
  'The number of requests for the first view', 'pagemetric', '', 0,
  function(pageData) {
    if (pageData.webpagetest) {
      var stats = this.stats;
      pageData.webpagetest.response.data.run.forEach(function(run) {
        stats.push(run.firstView.results.requests);
      });
    }
  });