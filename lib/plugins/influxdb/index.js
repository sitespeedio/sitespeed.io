'use strict';

let path = require('path'),
  throwIfMissing = require('../../support/util').throwIfMissing,
  filterRegistry = require('../../support/filterRegistry'),
  Sender = require('./sender'),
  DataGenerator = require('./data-generator');

function isEmpty(o) {
  if (o === null || o === undefined)
    return true;

  if (typeof o === 'object')
    return Object.keys(o).length === 0;

  if (typeof o === 'string')
    return o.length === 0;

  return false;
}

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    throwIfMissing(options.influxdb, ['host', 'database'], 'influxdb');

    const opts = options.influxdb;
    this.sender = new Sender(opts);
    this.dataGenerator = new DataGenerator(opts.includeQueryParams);
  },
  processMessage(message) {
    if (!(message.type.endsWith('.summary') || message.type.endsWith('.pageSummary')))
      return;

    message = filterRegistry.filterMessage(message);
    if (isEmpty(message.data))
      return;

    let data = this.dataGenerator.dataFromMessage(message);

    if (data.length > 0) {
      return this.sender.send(data);
    } else {
      return Promise.reject(new Error('No data to send to influxdb for message:\n' +
        JSON.stringify(message, null, 2)));
    }
  }
};
