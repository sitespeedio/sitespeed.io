/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var util = require('../../util/yslowUtil');
var Aggregator = require('../aggregator');

module.exports = new Aggregator('numberOfDomains', 'Number Of Domains',
  'Many domains means many DNS lookups and that means slower pages.',
  'pagemetric', '', 2,
  function(pageData) {
    if (pageData.yslow) {
      this.stats.push(util.getNumberOfDomains(pageData.yslow.comps));
    }
  });
