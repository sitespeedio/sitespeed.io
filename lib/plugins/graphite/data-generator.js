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

    function keyPathFromMessage(message, includeQueryParams) {
      let typeParts = message.type.split('.');
      typeParts.push(typeParts.shift());

      if (message.url) {
        typeParts.splice(1, 0, flatten.keypathFromUrl(message.url, includeQueryParams));
      }

      return typeParts.join('.');
    }

    var keypath = keyPathFromMessage(message, this.includeQueryParams);

    return reduce(flatten.flattenMessageData(message), (entries, value, key) => {
      let fullKey = util.format('%s.%s.%s', this.namespace, keypath, key);
      entries.push(util.format('%s %s %s', fullKey, value, timestamp));
      return entries;
    }, []).join('\n') + '\n';
  }
}

module.exports = GraphiteDataGenerator;
