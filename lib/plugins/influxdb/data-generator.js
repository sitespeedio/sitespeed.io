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
