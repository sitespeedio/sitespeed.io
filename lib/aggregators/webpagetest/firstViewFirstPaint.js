/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
 var Aggregator = require('../../aggregator');

module.exports = new Aggregator('wpt.firstViewFirstPaint',
  'First Paint of first view',
  'The first paint time fetched using WebPageTest','milliseconds',0,
  function(pageData) {
    if (pageData.webpagetest) {
      if (pageData.webpagetest.response.data.median.firstView.firstPaint)
        this.stats.push(pageData.webpagetest.response.data.median.firstView.firstPaint);
    }
  });
