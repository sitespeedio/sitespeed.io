/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Aggregator = require('../aggregator');

module.exports = new Aggregator('domElements', 'Number of DOM elements',
  'Too many DOM elements means that the page is complex and will be slower to render',
  'pagemetric', '', 1,
  function(pageData) {
    if (pageData.yslow) {
      if (pageData.yslow.g.mindom) {
        this.stats.push(pageData.yslow.g.mindom.components.length);
      } else {
        this.stats.push(0);
      }
    }
  });
