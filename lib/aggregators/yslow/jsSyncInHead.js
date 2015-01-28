/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Aggregator = require('../aggregator');

module.exports = new Aggregator('jsSyncInHead',
  'Number of JS synchronously inside head',
  'Loading Javascript synchronously inside of the HEAD tag will slow down your page rendering. Just don\'t do it!',
  'pagemetric', '', 2,
  function(pageData) {
    if (pageData.yslow) {
      if (pageData.yslow.g.syncjsinhead) {
        this.stats.push(pageData.yslow.g.syncjsinhead.components.length);
      } else {
        this.stats.push(0);
      }
    }
  });
