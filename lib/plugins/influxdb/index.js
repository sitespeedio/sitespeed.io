'use strict';

const throwIfMissing = require('../../support/util').throwIfMissing;
const isEmpty = require('lodash.isempty');
const filterRegistry = require('../../support/filterRegistry');
const log = require('intel');
const Sender = require('./sender');
const DataGenerator = require('./data-generator');

module.exports = {
  open(context, options) {
    throwIfMissing(options.influxdb, ['host', 'database'], 'influxdb');
    log.info('Setup InfluxDB host %s and database %s', options.influxdb.host, options.influxdb.database);

    const opts = options.influxdb;
    this.sender = new Sender(opts);
    this.dataGenerator = new DataGenerator(opts.includeQueryParams);
  },
  processMessage(message) {
    if (!(message.type.endsWith('.summary') || message.type.endsWith('.pageSummary')))
      return;

    // we only sends individual groups to Influx, not the
    // total of all groups (you can calculate that yourself)
    if (message.group === 'total') {
      return;
    }

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
