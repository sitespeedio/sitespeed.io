'use strict';

const get = require('lodash.get');
const flatten = require('./flattenMessage');

module.exports = {
  toSafeKey(key) {
    return key.replace(/[.~ /+|,:?&%]|%7C/g, '_');
  },
  getConnectivity(options) {
    // if we have a friendly name for your connectivity, use that!
    let connectivity = get(options, 'browsertime.connectivity.alias');
    if (connectivity) {
      return this.toSafeKey(connectivity);
    } else {
      return options.connectivity;
    }
  },
  getURLAndGroup(options, group, url, includeQueryParams) {
    if (
      group &&
      options.urlsMetaData &&
      options.urlsMetaData[url] &&
      options.urlsMetaData[url].alias
    ) {
      let alias = options.urlsMetaData[url].alias;
      return this.toSafeKey(group) + '.' + this.toSafeKey(alias);
    } else {
      return flatten.keypathFromUrl(url, includeQueryParams);
    }
  }
};
