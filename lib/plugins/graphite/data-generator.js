'use strict';

const flatten = require('../../support/flattenMessage'),
  util = require('util'),
  reduce = require('lodash.reduce');

class GraphiteDataGenerator {
  constructor(namespace, includeQueryParams) {
    this.namespace = namespace;
    this.includeQueryParams = !!includeQueryParams;
  }

  dataFromMessage(message) {
    const timestamp = Math.round(Date.now() / 1000);

    let keypath;
    if (message.url) {
      keypath = flatten.keypathFromUrl(message.url, this.includeQueryParams);
    } else {
      keypath = 'summary';
    }

    let graphiteEntries = reduce(flatten.flattenMessageData(message), (entries, value, key) => {
      let fullKey = util.format('%s.%s.%s', this.namespace, keypath, key);
      entries.push(util.format('%s %s %s', fullKey, value, timestamp));
      return entries;
    }, []);

    return graphiteEntries.join('\n');
  }
}

module.exports = GraphiteDataGenerator;
