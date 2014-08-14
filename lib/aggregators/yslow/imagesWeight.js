/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
 var Aggregator = require('../../aggregator');

module.exports = new Aggregator('imageWeight', 'Image Weight',
  'The weight of images is important, are usually 60-70% of the total page weight ',
  'bytes', 2,
  function(pageData) {
    if (pageData.yslow) {
      // there's a bug in YSlow that calculates the size wrong
      // so it is better to get it per type
      // also YSlow/PhantomJs don't know about compressed size
      var self = this;
      pageData.yslow.comps.forEach(function(comp) {
        if (comp.type === 'image') {
          self.stats.push(comp.size);
        }
      });
    }
  });
