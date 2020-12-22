'use strict';

const throwIfMissing = require('../../support/util').throwIfMissing;
const isEmpty = require('lodash.isempty');
const log = require('intel').getLogger('sitespeedio.plugin.influxdb');
const Sender = require('./sender');
const tsdbUtil = require('../../support/tsdbUtil');
const sendAnnotations = require('./send-annotation');
const DataGenerator = require('./data-generator');
const path = require('path');
const cliUtil = require('../../cli/util');

module.exports = {
  name() {
    return path.basename(__dirname);
  },

  /**
   * Define `yargs` options with their respective default values. When displayed by the CLI help message
   * all options are namespaced by its plugin name.
   *
   * @return {Object<string, require('yargs').Options} an object mapping the name of the option and its yargs configuration
   */
  get cliOptions() {
    return require(path.resolve(__dirname, 'cli.js'));
  },

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
    this.messageTypesToFireAnnotations = [];
    this.receivedTypesThatFireAnnotations = {};
    this.make = context.messageMaker('influxdb').make;
    this.sendAnnotation = true;
    this.alias = {};
    this.wptExtras = {};
  },
  processMessage(message, queue) {
    const filterRegistry = this.filterRegistry;

    // First catch if we are running Browsertime and/or WebPageTest
    if (message.type === 'browsertime.setup') {
      this.messageTypesToFireAnnotations.push('browsertime.pageSummary');
      this.usingBrowsertime = true;
    } else if (message.type === 'webpagetest.setup') {
      this.messageTypesToFireAnnotations.push('webpagetest.pageSummary');
    } else if (message.type === 'browsertime.config') {
      if (message.data.screenshot) {
        this.useScreenshots = message.data.screenshot;
        this.screenshotType = message.data.screenshotType;
      }
    } else if (message.type === 'sitespeedio.setup') {
      // Let other plugins know that the InfluxDB plugin is alive
      queue.postMessage(this.make('influxdb.setup'));
    } else if (message.type === 'grafana.setup') {
      this.sendAnnotation = false;
    }

    if (message.type === 'browsertime.alias') {
      this.alias[message.url] = message.data;
    }

    if (
      !(
        message.type.endsWith('.summary') ||
        message.type.endsWith('.pageSummary')
      )
    ) {
      return;
    }

    if (this.messageTypesToFireAnnotations.includes(message.type)) {
      this.receivedTypesThatFireAnnotations[message.url]
        ? this.receivedTypesThatFireAnnotations[message.url]++
        : (this.receivedTypesThatFireAnnotations[message.url] = 1);
    }

    if (message.type === 'webpagetest.pageSummary') {
      this.wptExtras[message.url] = {};
      this.wptExtras[message.url].webPageTestResultURL =
        message.data.data.summary;
      this.wptExtras[message.url].connectivity = message.connectivity;
      this.wptExtras[message.url].location = tsdbUtil.toSafeKey(
        message.location
      );
    }

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

    let data = this.dataGenerator.dataFromMessage(
      message,
      this.timestamp,
      this.alias
    );

    if (data.length > 0) {
      log.debug('Send the following data to InfluxDB: %:2j', data);
      return this.sender.send(data).then(() => {
        // Make sure we only send the annotation once per URL:
        // If we run browsertime, always send on browsertime.pageSummary
        // If we run WebPageTest standalone, send on webPageTestSummary
        // when we configured a base url
        if (
          this.receivedTypesThatFireAnnotations[message.url] ===
            this.messageTypesToFireAnnotations.length &&
          this.resultUrls.hasBaseUrl() &&
          this.sendAnnotation
        ) {
          const absolutePagePath = this.resultUrls.absoluteSummaryPagePath(
            message.url,
            this.alias[message.url]
          );
          this.receivedTypesThatFireAnnotations[message.url] = 0;

          return sendAnnotations.send(
            message.url,
            message.group,
            absolutePagePath,
            this.useScreenshots,
            this.screenshotType,
            // Browsertime pass on when the first run was done for that URL
            message.runTime,
            this.alias,
            this.wptExtras[message.url],
            this.usingBrowsertime,
            this.options
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
  get config() {
    return cliUtil.pluginDefaults(this.cliOptions);
  }
};
