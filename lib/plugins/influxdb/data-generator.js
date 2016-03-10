'use strict';

const flatten = require('../../support/flattenMessage'),
  util = require('util'),
  reduce = require('lodash.reduce');

class InfluxDBDataGenerator {
  constructor(includeQueryParams) {
    this.includeQueryParams = !!includeQueryParams;
  }

  dataFromMessage(message) {
    const time = Date.now();

    let keypath;
    if (message.url) {
      keypath = flatten.keypathFromUrl(message.url, this.includeQueryParams);
    } else {
      keypath = 'summary';
    }

    return reduce(flatten.flattenMessageData(message), (entries, value, key) => {
      let seriesName = util.format('%s.%s', keypath, key);
      entries.push({
        seriesName,
        point: {value, time}
      });
      return entries;
    }, []);
  }
}

module.exports = InfluxDBDataGenerator;
