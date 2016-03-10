'use strict';

var Promise = require('bluebird'),
  gpagespeed = require('gpagespeed');

gpagespeed = Promise.promisify(gpagespeed);

module.exports = {
  analyzeUrl: function(url, options) {
    return gpagespeed({url, key: options.key});
  }
};
