/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Aggregator = require('../../aggregator');

module.exports = new Aggregator('cssWeightPerPage', 'CSS File Weight Per Page',
  "Don't download large front-end CSS farmework when you only use small parts of it.",
  'bytes', 2,
  function(pageData) {
    if (pageData.yslow) {
      // there's a bug in YSlow that calculates the size wrong
      // so it is better to get it per type
      // also YSlow/PhantomJs don't know about compressed size
      var size = 0;
      pageData.yslow.comps.forEach(function(comp) {
        if (comp.type === 'css') {
          size += comp.size;
        }
      });
      this.stats.push(size);
    }
  });
