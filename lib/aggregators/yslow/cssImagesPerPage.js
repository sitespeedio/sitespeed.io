/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Aggregator = require('../aggregator');

module.exports = new Aggregator('cssImagesPerPage',
  'Number of CSS images per page',
  'Few larger CSS images are better when using HTTP 1.1. For HTTP 2.0 it is better with many small files from few domains.',
  'pagemetric', '', 2,
  function(pageData) {
    if (pageData.yslow) {
      if (pageData.yslow.stats.cssimage) {
        this.stats.push(pageData.yslow.stats.cssimage.r);
      } else {
        this.stats.push(0);
      }
    }
  });
