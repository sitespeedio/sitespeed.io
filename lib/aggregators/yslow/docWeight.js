/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Aggregator = require('../aggregator');

module.exports = new Aggregator('docWeight', 'Document Weight',
  'Keep the document at a reasonable size, it will make it possible for the browser to generate the page faster.',
  'pagemetric', 'bytes', 2,
  function(pageData) {
    if (pageData.yslow) {
      // there's a bug in YSlow that calculates the size wrong
      // so it is better to get it per type
      // also YSlow/PhantomJs don't know about compressed size
      var self = this;
      pageData.yslow.comps.forEach(function(comp) {
        if (comp.type === 'doc' && comp.size !== '-1') {
          self.stats.push(comp.size);
        }
      });
    }
  });
