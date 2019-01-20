'use strict';

const flatten = require('../../support/flattenMessage'),
  util = require('util'),
  graphiteUtil = require('../../support/tsdbUtil'),
  reduce = require('lodash.reduce'),
  formatEntry = require('./helpers/format-entry'),
  isStatsd = require('./helpers/is-statsd');

const STATSD = 'statsd';
const GRAPHITE = 'graphite';

function keyPathFromMessage(message, options, includeQueryParams, alias) {
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
      typeParts.splice(2, 0, graphiteUtil.toSafeKey(message.location));
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
        includeQueryParams,
        alias
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
    this.entryFormat = isStatsd(options.graphite) ? STATSD : GRAPHITE;
  }

  dataFromMessage(message, time, alias) {
    const timestamp = Math.round(time.valueOf() / 1000);

    const keypath = keyPathFromMessage(
      message,
      this.options,
      this.includeQueryParams,
      alias
    );

    return reduce(
      flatten.flattenMessageData(message),
      (entries, value, key) => {
        const fullKey = util.format('%s.%s.%s', this.namespace, keypath, key);
        const args = [formatEntry(this.entryFormat), fullKey, value];
        this.entryFormat === GRAPHITE && args.push(timestamp);

        entries.push(util.format.apply(util, args));
        return entries;
      },
      []
    );
  }
}

module.exports = GraphiteDataGenerator;
