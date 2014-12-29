/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Aggregator = require('../aggregator');

module.exports = new Aggregator('repeatViewImageSavingsWPT',
  'Image Savings Repeat View',
  'How much that can be saved if the images are compressed (fetched using WebPageTest)', 'pagemetric', 'bytes', 0,
  function(pageData) {
    if (pageData.webpagetest) {
      var stats = this.stats;
      pageData.webpagetest.wpt.forEach(function(browserAndLocation) {
        browserAndLocation.response.data.run.forEach(function(run) {
          stats.push(run.repeatView.results.image_savings); // jshint ignore:line
        });
      });
    }
  });
