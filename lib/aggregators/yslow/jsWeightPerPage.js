/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
 var Aggregator = require('../../aggregator');

module.exports = new Aggregator('jsWeightPerPage', 'JS File Weight Per Page',
  "Don't download large Javascript libraries when you only use small parts of it.",
  'bytes', 2,
  function(pageData) {
    if (pageData.yslow) {
      // there's a bug in YSlow that calculates the size wrong
      // so it is better to get it per type
      // also YSlow/PhantomJs don't know about compressed size
      var size = 0;
      pageData.yslow.comps.forEach(function(comp) {
        if (comp.type === 'js') {
          size += comp.size;
        }
      });
      this.stats.push(size);
    }
  });
