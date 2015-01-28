/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Aggregator = require('../aggregator');
var util = require('../../util/yslowUtil');

module.exports = new Aggregator('imagesWeightPerPage', 'Images Weight Per Page',
  'Image weight are the largest part of a web page. Make sure they are compressed and as small as possible.',
  'pagemetric', 'bytes', 2,
  function(pageData) {
    if (pageData.yslow) {
      // there's a bug in YSlow that calculates the size wrong
      // so it is better to get it per type
      // also YSlow/PhantomJs don't know about compressed size
      this.stats.push(util.getSize(pageData.yslow.comps, 'image'));
    }
  });
