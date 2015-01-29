/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Aggregator = require('../aggregator');
var util = require('../../util/yslowUtil');

module.exports = new Aggregator('jsWeightPerPage', 'JS File Weight Per Page',
  'Don\'t download large Javascript libraries when you only use small parts of it.',
  'pagemetric', 'bytes', 2,
  function(pageData) {
    if (pageData.yslow) {
      // there's a bug in YSlow that calculates the size wrong
      // so it is better to get it per type
      // also YSlow/PhantomJs don't know about compressed size
      this.stats.push(util.getSize(pageData.yslow.comps, 'js'));
    }
  });
