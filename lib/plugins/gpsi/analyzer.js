'use strict';

var Promise = require('bluebird'),
  gpagespeed = require('gpagespeed');

gpagespeed = Promise.promisify(gpagespeed);

module.exports = {
  analyzeUrl: function(url, options) {
    const args = {url};

    if (options.key) {
      args.key = options.key;
    } else {
      args.nokey = true;
    }

    return gpagespeed(args);
  }
};
