/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
 var Aggregator = require('../../aggregator');

module.exports = new Aggregator('wpt.speedIndex',
  'Speed Index',
  'The Speed Index is the average time at which visible parts of the page are displayed.  It is expressed in milliseconds and dependent on size of the view port. Using WebPageTest','',0,
  function(pageData) {
    if (pageData.webpagetest) {
      if (pageData.webpagetest.response.data.median.firstView.SpeedIndex)
        this.stats.push(pageData.webpagetest.response.data.median.firstView.SpeedIndex);
    }
  });
