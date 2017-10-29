'use strict';

const throwIfMissing = require('../../support/util').throwIfMissing;
const isEmpty = require('lodash.isempty');
const log = require('intel').getLogger('sitespeedio.plugin.influxdb');
const Sender = require('./sender');
const sendAnnotations = require('./send-annotation');
const DataGenerator = require('./data-generator');

const defaultConfig = {
  port: 8086,
  protocol: 'http',
  database: 'sitespeed',
  tags: 'category=default',
  includeQueryParams: false
};

module.exports = {
  open(context, options) {
    throwIfMissing(options.influxdb, ['host', 'database'], 'influxdb');
    this.filterRegistry = context.filterRegistry;
    log.debug(
      'Setup InfluxDB host %s and database %s',
      options.influxdb.host,
      options.influxdb.database
    );

    const opts = options.influxdb;
    this.options = options;
    this.sender = new Sender(opts);
    this.timestamp = context.timestamp;
    this.resultUrls = context.resultUrls;
    this.dataGenerator = new DataGenerator(opts.includeQueryParams, options);
  },
  processMessage(message) {
    const filterRegistry = this.filterRegistry;
    if (
      !(
        message.type.endsWith('.summary') ||
        message.type.endsWith('.pageSummary')
      )
    )
      return;

    // Let us skip this for a while and concentrate on the real deal
    if (
      message.type.match(
        /(^largestassets|^slowestassets|^aggregateassets|^domains)/
      )
    )
      return;

    // we only sends individual groups to Influx, not the
    // total of all groups (you can calculate that yourself)
    if (message.group === 'total') {
      return;
    }

    message = filterRegistry.filterMessage(message);
    if (isEmpty(message.data)) return;

    let data = this.dataGenerator.dataFromMessage(message, this.timestamp);

    if (data.length > 0) {
      return this.sender.send(data).then(() => {
        // make sure we only send once per URL (and browsertime is the most important)
        // and you need to configure a base URL where you get the HTML result
        if (
          message.type === 'browsertime.pageSummary' &&
          this.resultUrls.hasBaseUrl()
        ) {
          const resultPageUrl = this.resultUrls.absoluteSummaryPageUrl(
            message.url
          );
          return sendAnnotations.send(
            this.options,
            message.group,
            message.url,
            resultPageUrl,
            this.timestamp
          );
        }
      });
    } else {
      return Promise.reject(
        new Error(
          'No data to send to influxdb for message:\n' +
            JSON.stringify(message, null, 2)
        )
      );
    }
  },
  config: defaultConfig
};
