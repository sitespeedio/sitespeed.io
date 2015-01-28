/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var util = require('../../util/yslowUtil');
var Aggregator = require('../aggregator');

module.exports = new Aggregator('timeSinceLastMod',
  'Time since last modification',
  'The time since a file was changed the last time. If it was long ago, please make sure the cache time is high!',
  'pagemetric', 'seconds', 0,
  function(pageData) {
    if (pageData.yslow) {
      var self = this;
      pageData.yslow.comps.forEach(function(comp) {
        self.stats.push(util.getTimeSinceLastMod(comp));
      });
    }
  });
