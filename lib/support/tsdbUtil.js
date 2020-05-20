'use strict';

const get = require('lodash.get');
const flatten = require('./flattenMessage');

module.exports = {
  toSafeKey(key, safeChar = '_') {
    return key.replace(/[.~ /+|,:?&%–]|%7C/g, safeChar);
  },
  getConnectivity(options) {
    // if we have a friendly name for your connectivity, use that!
    let connectivity = get(options, 'browsertime.connectivity.alias');
    if (connectivity) {
      // If the alias is a number, it is converted to a Number by get.
      return this.toSafeKey(connectivity.toString());
    } else {
      return get(options, 'browsertime.connectivity.profile', 'unknown');
    }
  },
  getURLAndGroup(options, group, url, includeQueryParams, alias) {
    if (
      group &&
      options.urlsMetaData &&
      options.urlsMetaData[url] &&
      options.urlsMetaData[url].urlAlias
    ) {
      let alias = options.urlsMetaData[url].urlAlias;
      return this.toSafeKey(group) + '.' + this.toSafeKey(alias);
    } else if (alias && alias[url]) {
      return this.toSafeKey(group) + '.' + this.toSafeKey(alias[url]);
    } else {
      return flatten.keypathFromUrl(
        url,
        includeQueryParams,
        options.useHash,
        group
      );
    }
  }
};
