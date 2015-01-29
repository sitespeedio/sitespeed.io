/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Aggregator = require('../aggregator');

module.exports = new Aggregator('browserScaledImages',
  'Images scaled by the browser',
  'Never scale images in the browser, that will slow down the rendering.',
  'rule', '', 1,
  function(pageData) {
    if (pageData.yslow) {
      if (pageData.yslow.g.avoidscalingimages) {
        this.stats.push(pageData.yslow.g.avoidscalingimages.components.length);
      } else {
        this.stats.push(0);
      }
    }
  });
