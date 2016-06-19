'use strict';

const flatten = require('../../support/flattenMessage'),
  util = require('util'),
  supportUtil = require('../../support/util'),
  reduce = require('lodash.reduce');

class GraphiteDataGenerator {
  constructor(namespace, includeQueryParams, options) {
    this.namespace = namespace;
    this.includeQueryParams = !!includeQueryParams;
    this.options = options;
  }

  dataFromMessage(message, time) {
    const timestamp = Math.round(time.valueOf() / 1000);
    let options = this.options;

    function keyPathFromMessage(message, includeQueryParams) {
      let typeParts = message.type.split('.');
      typeParts.push(typeParts.shift());

      // always have browser and connectivity in Browsertime and related tools
      if (message.type.match(/(^pagexray|^coach|^browsertime|^assets|^domains)/)) {
        typeParts.splice(1, 0, options.connectivity);
        typeParts.splice(1, 0, options.browser);
      } else if (message.type.match(/(^webpagetest)/)) {
        if (message.connectivity) {
          typeParts.splice(2, 0, message.connectivity);
        }
        if (message.location) {
        typeParts.splice(2, 0, message.location);
        }
      }

      if (message.url) {
        typeParts.splice(1, 0, flatten.keypathFromUrl(message.url, includeQueryParams));
      } else {
        // it's a summary, add domain/filename
        typeParts.splice(1, 0, supportUtil.getDomainOrFileName(options._[0]).replace(/\./g, '_'));
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
