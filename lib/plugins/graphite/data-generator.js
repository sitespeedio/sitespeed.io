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
      /(^pagexray|^coach|^browsertime|^largestassets|^slowestassets|^aggregateassets|^domains|^thirdparty|^axe|^sustainable)/
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
  } else if (message.type.match(/(^gpsi)/)) {
    typeParts.splice(2, 0, options.mobile ? 'mobile' : 'desktop');
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

  if (options.graphite && options.graphite.addSlugToKey) {
    typeParts.unshift(options.slug);
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
    let timestamp = Math.round(time.valueOf() / 1000);

    const keypath = keyPathFromMessage(
      message,
      this.options,
      this.includeQueryParams,
      alias
    );

    return reduce(
      flatten.flattenMessageData(message),
      (entries, value, key) => {
        if (message.type === 'browsertime.run') {
          if (key.includes('timings') && key.includes('marks')) {
            key = key.replace(/marks\.(\d+)/, function (match, idx) {
              return (
                'marks.' + message.data.timings.userTimings.marks[idx].name
              );
            });
          }

          if (key.includes('timings') && key.includes('measures')) {
            key = key.replace(/measures\.(\d+)/, function (match, idx) {
              return (
                'measures.' +
                message.data.timings.userTimings.measures[idx].name
              );
            });
          }
        }
        if (message.type === 'pagexray.run') {
          if (key.includes('assets')) {
            key = key.replace(
              /assets\.(\d+)/,
              function (match, idx) {
                let url = new URL(message.data.assets[idx].url);
                url.search = '';
                return 'assets.' + graphiteUtil.toSafeKey(url.toString());
              },
              {}
            );
          }
        }

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
