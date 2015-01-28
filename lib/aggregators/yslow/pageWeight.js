/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var util = require('../../util/yslowUtil');
var Aggregator = require('../aggregator');

module.exports = new Aggregator('pageWeight',
  'Total page weight (including all assets)',
  'The total size is really important because of slow mobile networks, keep the size small.',
  'pagemetric', 'bytes', 2,
  function(pageData) {
    if (pageData.yslow) {
      this.stats.push(util.getSize(pageData.yslow.comps));
    }
  });
