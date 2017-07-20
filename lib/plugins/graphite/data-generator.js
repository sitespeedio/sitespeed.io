'use strict';

const flatten = require('../../support/flattenMessage'),
  util = require('util'),
  graphiteUtil = require('../../support/tsdbUtil'),
  reduce = require('lodash.reduce');

function keyPathFromMessage(message, options, includeQueryParams) {
  let typeParts = message.type.split('.');
  typeParts.push(typeParts.shift());

  // always have browser and connectivity in Browsertime and related tools
  if (
    message.type.match(
      /(^pagexray|^coach|^browsertime|^largestassets|^slowestassets|^aggregateassets|^domains)/
    )
  ) {
    // if we have a friendly name for your connectivity, use that!
    let connectivity = graphiteUtil.getConnectivity(options);

    typeParts.splice(1, 0, connectivity);
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
    typeParts.splice(
      1,
      0,
      graphiteUtil.getURLAndGroup(
        options,
        message.group,
        message.url,
        includeQueryParams
      )
    );
  } else if (message.group) {
    // add the group of the summary message
    typeParts.splice(1, 0, graphiteUtil.toSafeKey(message.group));
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

    const keypath = keyPathFromMessage(
      message,
      this.options,
      this.includeQueryParams
    );

    return reduce(
      flatten.flattenMessageData(message),
      (entries, value, key) => {
        const fullKey = util.format('%s.%s.%s', this.namespace, keypath, key);
        entries.push(util.format('%s %s %s', fullKey, value, timestamp));
        return entries;
      },
      []
    );
  }
}

module.exports = GraphiteDataGenerator;
