'use strict';

const isEmpty = require('lodash.isempty');
const GraphiteSender = require('./graphite-sender');
const StatsDSender = require('./statsd-sender');
const merge = require('lodash.merge');
const get = require('lodash.get');
const log = require('intel').getLogger('sitespeedio.plugin.graphite');
const sendAnnotations = require('./send-annotation');
const DataGenerator = require('./data-generator');
const graphiteUtil = require('../../support/tsdbUtil');
const isStatsd = require('./helpers/is-statsd');
const throwIfMissing = require('../../support/util').throwIfMissing;

const defaultConfig = {
  port: 2003,
  namespace: 'sitespeed_io.default',
  includeQueryParams: false,
  statsd: false,
  bulkSize: null,
  perIteration: false
};

module.exports = {
  open(context, options) {
    throwIfMissing(options.graphite, ['host'], 'graphite');
    const opts = merge({}, defaultConfig, options.graphite);
    this.options = options;
    this.perIteration = get(opts, 'experimental.perIteration', false);
    const SenderConstructor = isStatsd(opts) ? StatsDSender : GraphiteSender;

    this.filterRegistry = context.filterRegistry;
    this.sender = new SenderConstructor(opts.host, opts.port, opts.bulkSize);
    this.dataGenerator = new DataGenerator(
      opts.namespace,
      opts.includeQueryParams,
      options
    );
    log.debug(
      'Setting up Graphite %s:%s for namespace %s',
      opts.host,
      opts.port,
      opts.namespace
    );
    this.timestamp = context.timestamp;
    this.resultUrls = context.resultUrls;
    this.messageTypesToFireAnnotations = [];
    this.receivedTypesThatFireAnnotations = {};
    this.make = context.messageMaker('graphite').make;
    this.sendAnnotation = true;
    this.alias = {};
    this.wptExtras = {};
    this.usingBrowsertime = false;
  },

  processMessage(message, queue) {
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
      // Let other plugins know that the Graphite plugin is alive
      queue.postMessage(this.make('graphite.setup'));
    } else if (message.type === 'grafana.setup') {
      this.sendAnnotation = false;
    }

    if (message.type === 'browsertime.alias') {
      this.alias[message.url] = message.data;
    }

    const filterRegistry = this.filterRegistry;
    if (
      !(
        message.type.endsWith('.summary') ||
        message.type.endsWith('.pageSummary') ||
        (this.perIteration && message.type.endsWith('.run'))
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
      this.wptExtras[message.url].location = graphiteUtil.toSafeKey(
        message.location
      );
    }

    // we only sends individual groups to Graphite, not the
    // total of all groups (you can calculate that yourself)
    if (message.group === 'total') {
      return;
    }

    message = filterRegistry.filterMessage(message);
    if (isEmpty(message.data)) return;

    // TODO Here we could add logic to either create a new timestamp or
    // use the one that we have for that run. Now just use the one for the
    // run
    const dataPoints = this.dataGenerator.dataFromMessage(
      message,
      this.timestamp,
      this.alias
    );

    if (dataPoints.length > 0) {
      const data = dataPoints.join('\n') + '\n';
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
          this.receivedTypesThatFireAnnotations[message.url] = 0;
          const absolutePagePath = this.resultUrls.absoluteSummaryPagePath(
            message.url
          );
          return sendAnnotations.send(
            message.url,
            message.group,
            absolutePagePath,
            this.useScreenshots,
            this.screenshotType,
            this.timestamp,
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
          'No data to send to graphite for message:\n' +
            JSON.stringify(message, null, 2)
        )
      );
    }
  },
  config: defaultConfig
};
