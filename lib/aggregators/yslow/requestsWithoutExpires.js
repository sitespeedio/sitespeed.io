/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var util = require('../../util/yslowUtil');
var Aggregator = require('../aggregator');

module.exports = new Aggregator('requestsWithoutExpires',
  'Requests Without Expires',
  'Requests shall always have expire headers, so that they can be cached by the browser',
  'pagemetric', '', 2,
  function(pageData) {
    if (pageData.yslow) {
      var requestsWithoutExpire = 0;
      pageData.yslow.comps.forEach(function(comp) {
        if (util.getCacheTime(comp) === 0) {
          requestsWithoutExpire++;
        }
      });
      this.stats.push(requestsWithoutExpire);
    }
  });
