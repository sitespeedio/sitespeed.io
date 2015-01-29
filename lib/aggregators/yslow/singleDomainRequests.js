/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var util = require('../../util/yslowUtil');
var Aggregator = require('../aggregator');

module.exports = new Aggregator('singleDomainRequests', 'Domains with only one request',
  'Many domains means many DNS lookups and that means slower pages. Only loading one request for one domain is wasteful.',
  'pagemetric', '', 2,
  function(pageData) {
    if (pageData.yslow) {
      var hostAndRequests = util.getAssetsPerDomain(pageData.yslow.comps);
      var keys = Object.keys(hostAndRequests);
      var domainsWithOneRequest = 0;

      // take the hosts with the most requests
      for (var i = 0; i < keys.length; i++) {
        if (hostAndRequests[keys[i]] === 1) {
          domainsWithOneRequest++;
        }
      }
      this.stats.push(domainsWithOneRequest);
    }
  });
