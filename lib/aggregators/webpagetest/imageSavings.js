/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
 var Aggregator = require('../../aggregator');

module.exports = new Aggregator('wpt.imageSavings',
  'Image Savings',
  'How much that can be saved if the images are compressed (using WebPageTest)','bytes',0,
  function(pageData) {
    if (pageData.webpagetest) {
      if (pageData.webpagetest.response.data.median.firstView.image_savings)
        this.stats.push(pageData.webpagetest.response.data.median.firstView.image_savings);
    }
  });
