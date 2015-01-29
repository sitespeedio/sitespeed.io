/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Aggregator = require('../aggregator');

module.exports = new Aggregator('requestsWithoutGzip', 'Requests without GZip',
  'All text content (JS/CSS/HTML) can and should be sent GZiped so that the size is as small as possible.',
  'pagemetric', '', 2,
  function(pageData) {
    if (pageData.yslow) {
      if (pageData.yslow.g.ycompress) {
        this.stats.push(pageData.yslow.g.ycompress.components.length);
      } else {
        this.stats.push(0);
      }
    }

  });
