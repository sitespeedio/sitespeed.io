/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Aggregator = require('../aggregator');

module.exports = new Aggregator('noDuplicates', 'Remove duplicate JS and CSS',
  'It is bad practice include the same js or css twice since browsers will execute the code each time',
  'rule', '', 1,
  function(pageData) {
    if (pageData.yslow) {
      if (pageData.yslow.g.noduplicates) {
        this.stats.push(pageData.yslow.g.noduplicates.components.length);
      } else {
        this.stats.push(0);
      }
    }

  });
