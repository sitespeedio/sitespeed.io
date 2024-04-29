import isEmpty from 'lodash.isempty';
import intel from 'intel';
import dayjs from 'dayjs';

import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import { InfluxDBSender as Sender } from './sender.js';
import { InfluxDB2Sender as SenderV2 } from './senderV2.js';
import { send } from './send-annotation.js';
import { InfluxDBDataGenerator as DataGenerator } from './data-generator.js';
import { throwIfMissing } from '../../support/util.js';

const log = intel.getLogger('sitespeedio.plugin.influxdb');
export default class InfluxDBPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'influxdb', options, context, queue });
  }

  open(context, options) {
    throwIfMissing(options.influxdb, ['host', 'database'], 'influxdb');
    this.filterRegistry = context.filterRegistry;
    log.debug(
      'Setup InfluxDB host %s and database %s',
      options.influxdb.host,
      options.influxdb.database
    );

    const options_ = options.influxdb;
    this.options = options;
    this.sender =
      options_.version == 1 ? new Sender(options_) : new SenderV2(options_);
    this.timestamp = context.timestamp;
    this.resultUrls = context.resultUrls;
    this.dataGenerator = new DataGenerator(
      options_.includeQueryParams,
      options
    );
    this.messageTypesToFireAnnotations = [];
    this.receivedTypesThatFireAnnotations = {};
    this.make = context.messageMaker('influxdb').make;
    this.sendAnnotation = true;
    this.alias = {};
  }

  processMessage(message, queue) {
    const filterRegistry = this.filterRegistry;

    // First catch if we are running Browsertime and/or WebPageTest
    switch (message.type) {
      case 'browsertime.setup': {
        this.messageTypesToFireAnnotations.push('browsertime.pageSummary');
        this.usingBrowsertime = true;

        break;
      }
      case 'browsertime.config': {
        if (message.data.screenshot) {
          this.useScreenshots = message.data.screenshot;
          this.screenshotType = message.data.screenshotType;
        }

        break;
      }
      case 'sitespeedio.setup': {
        // Let other plugins know that the InfluxDB plugin is alive
        queue.postMessage(this.make('influxdb.setup'));

        break;
      }
      case 'grafana.setup': {
        this.sendAnnotation = false;

        break;
      }
      // No default
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

    // Let us skip this for a while and concentrate on the real deal
    if (
      /(^largestassets|^slowestassets|^aggregateassets|^domains)/.test(
        message.type
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
      message.type === 'browsertime.pageSummary'
        ? dayjs(message.runTime)
        : this.timestamp,
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

          return send(
            message.url,
            message.group,
            absolutePagePath,
            this.useScreenshots,
            this.screenshotType,
            // Browsertime pass on when the first run was done for that URL
            message.runTime,
            this.alias,
            this.usingBrowsertime,
            this.options
          );
        }
      });
    } else {
      return Promise.reject(
        new Error(
          'No data to send to influxdb for message:\n' +
            JSON.stringify(message, undefined, 2)
        )
      );
    }
  }
}
