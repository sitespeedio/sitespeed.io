/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
 var Aggregator = require('../../aggregator');

module.exports = new Aggregator('wpt.visualComplete',
  'Visual Complete',
  'Time of the last visual change to the page. Using WebPageTest','milliseconds',0,
  function(pageData) {
    if (pageData.webpagetest) {
      if (pageData.webpagetest.response.data.median.firstView.visualComplete)
        this.stats.push(pageData.webpagetest.response.data.median.firstView.visualComplete);
    }
  });
