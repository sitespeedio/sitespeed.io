// eslint-disable-next-line unicorn/import-style
import util, { format } from 'node:util';
import {
  getConnectivity,
  toSafeKey,
  getURLAndGroup
} from '../../support/tsdbUtil.js';
import { flattenMessageData } from '../../support/flattenMessage.js';
import { formatEntry } from './helpers/format-entry.js';
import { isStatsD } from './helpers/is-statsd.js';

const STATSD = 'statsd';
const GRAPHITE = 'graphite';

function keyPathFromMessage(message, options, includeQueryParameters, alias) {
  let typeParts = message.type.split('.');
  typeParts.push(typeParts.shift());

  // always have browser and connectivity in Browsertime and related tools
  if (
    /(^pagexray|^coach|^browsertime|^largestassets|^slowestassets|^aggregateassets|^domains|^thirdparty|^axe|^compare|^sustainable)/.test(
      message.type
    )
  ) {
    // if we have a friendly name for your connectivity, use that!
    let connectivity = getConnectivity(options);

    typeParts.splice(1, 0, connectivity);
    typeParts.splice(1, 0, options.browser);
  } else if (/(^gpsi)/.test(message.type)) {
    typeParts.splice(2, 0, options.mobile ? 'mobile' : 'desktop');
  }

  // if we get a URL type, add the URL
  if (message.url) {
    typeParts.splice(
      1,
      0,
      getURLAndGroup(
        options,
        message.group,
        message.url,
        includeQueryParameters,
        alias
      )
    );
  } else if (message.group) {
    // add the group of the summary message
    typeParts.splice(1, 0, toSafeKey(message.group));
  }

  if (options.graphite && options.graphite.addSlugToKey && options.slug) {
    typeParts.unshift(options.slug);
  }

  return typeParts.join('.');
}
export class GraphiteDataGenerator {
  constructor(namespace, includeQueryParameters, options) {
    this.namespace = namespace;
    this.includeQueryParams = !!includeQueryParameters;
    this.options = options;
    this.entryFormat = isStatsD(options.graphite) ? STATSD : GRAPHITE;
  }

  dataFromMessage(message, time, alias) {
    const timestamp = Math.round(time.valueOf() / 1000);

    const keypath = keyPathFromMessage(
      message,
      this.options,
      this.includeQueryParams,
      alias
    );

    return Object.entries(flattenMessageData(message)).reduce(
      (entries, [key, value]) => {
        if (message.type === 'browsertime.run') {
          if (key.includes('timings') && key.includes('marks')) {
            key = key.replace(/marks\.(\d+)/, (match, index) => {
              return (
                'marks.' + message.data.timings.userTimings.marks[index].name
              );
            });
          }

          if (key.includes('timings') && key.includes('measures')) {
            key = key.replace(/measures\.(\d+)/, (match, index) => {
              return (
                'measures.' +
                message.data.timings.userTimings.measures[index].name
              );
            });
          }
        }
        if (message.type === 'pagexray.run' && key.includes('assets')) {
          key = key.replace(/assets\.(\d+)/, (match, index) => {
            const url = new URL(message.data.assets[index].url);
            url.search = '';
            return 'assets.' + toSafeKey(url.toString());
          });
        }

        const fullKey = format('%s.%s.%s', this.namespace, keypath, key);
        const arguments_ = [formatEntry(this.entryFormat), fullKey, value];
        if (this.entryFormat === GRAPHITE) {
          arguments_.push(timestamp);
        }

        entries.push(format.apply(util, arguments_));
        return entries;
      },
      []
    );
  }
}
