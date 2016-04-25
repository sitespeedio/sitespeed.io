'use strict';

var Promise = require('bluebird'),
  log = require('intel'),
  gpagespeed = require('gpagespeed');

gpagespeed = Promise.promisify(gpagespeed);

module.exports = {
  analyzeUrl: function(url, options) {
    log.info('Sending url ' + url + ' to test on Page Speed Insights');
    const args = {url};

    if (options.key) {
      args.key = options.key;
    } else {
      args.nokey = true;
    }

    return gpagespeed(args);
  }
};
