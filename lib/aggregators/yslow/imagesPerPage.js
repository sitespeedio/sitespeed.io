/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Aggregator = require('../aggregator');

module.exports = new Aggregator('imagesPerPage', 'Number of images per page',
  'Avoid too many images because it will take time for them all to load.',
  'pagemetric', '', 2,
  function(pageData) {
    if (pageData.yslow) {
      if (pageData.yslow.stats.image) {
        this.stats.push(pageData.yslow.stats.image.r);
      } else {
        this.stats.push(0);
      }
    }
  });
