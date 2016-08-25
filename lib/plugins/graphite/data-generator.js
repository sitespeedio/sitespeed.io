'use strict';

const flatten = require('../../support/flattenMessage'),
  util = require('util'),
  reduce = require('lodash.reduce');

function keyPathFromMessage(message, options, includeQueryParams) {
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
  // if we get a URL type, add the URL
  if (message.url) {
    typeParts.splice(1, 0, flatten.keypathFromUrl(message.url, includeQueryParams));
  } else {
    // add the group of the summary message
    // the group in the current version is the domain so lets
    // change the dots to underscore
    typeParts.splice(1, 0, message.group.replace(/\./g,'_'));
  }

  return typeParts.join('.');
}

class GraphiteDataGenerator {
  constructor(namespace, includeQueryParams, options) {
    this.namespace = namespace;
    this.includeQueryParams = !!includeQueryParams;
    this.options = options;
  }

  dataFromMessage(message, time) {
    const timestamp = Math.round(time.valueOf() / 1000);

    var keypath = keyPathFromMessage(message, this.options, this.includeQueryParams);

    return reduce(flatten.flattenMessageData(message), (entries, value, key) => {
      let fullKey = util.format('%s.%s.%s', this.namespace, keypath, key);
      entries.push(util.format('%s %s %s', fullKey, value, timestamp));
      return entries;
    }, []);
  }
}

module.exports = GraphiteDataGenerator;
