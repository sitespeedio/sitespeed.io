/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var Aggregator = require('../aggregator');

module.exports = new Aggregator('scoreGPSI', 'Google Page Speed Insights Score',
  'The score calculated by our friends at Google.', 'rule',
  '', 0,
  function(pageData) {
    if (pageData.gpsi) {
      this.stats.push(pageData.gpsi.score);
    }
  });
