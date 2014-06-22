/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var util = require('../../util');
var Aggregator = require('../../aggregator');

module.exports = new Aggregator('maxRequestsPerHost', 'Max requests per domain',
  'Using HTTP 1.1 you want to avoid loading too many assets from one domain',
  '', 2,
  function(pageData) {
    if (pageData.yslow) {
      var hostAndRequests = util.getAssetsPerDomain(pageData.yslow.comps),
        keys = Object.keys(hostAndRequests),
        maxRequestsPerHost = 0;

      // take the hosts with the most requests
      for (var i = 0; i < keys.length; i++) {
        if (hostAndRequests[keys[i]] > maxRequestsPerHost)
          maxRequestsPerHost = hostAndRequests[keys[i]];
      }
      this.stats.push(maxRequestsPerHost);
    }
  });
