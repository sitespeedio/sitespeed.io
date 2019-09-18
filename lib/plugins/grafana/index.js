'use strict';
const sendAnnotations = require('./send-annotation');
const tsdbUtil = require('../../support/tsdbUtil');
const throwIfMissing = require('../../support/util').throwIfMissing;
const defaultConfig = {
  port: 80
};
module.exports = {
  open(context, options) {
    throwIfMissing(options.grafana, ['host', 'port'], 'grafana');
    this.options = options;
    this.timestamp = context.timestamp;
    this.resultUrls = context.resultUrls;
    this.messageTypesToFireAnnotations = [];
    this.receivedTypesThatFireAnnotations = {};
    this.tsdbType = 'graphite';
    this.make = context.messageMaker('grafana').make;
    this.alias = {};
    this.wptExtras = {};
  },
  processMessage(message, queue) {
    if (message.type === 'webpagetest.pageSummary') {
      this.wptExtras[message.url] = {};
      this.wptExtras[message.url].webPageTestResultURL =
        message.data.data.summary;
      this.wptExtras[message.url].connectivity = message.connectivity;
      this.wptExtras[message.url].location = tsdbUtil.toSafeKey(
        message.location
      );
    }
    if (this.messageTypesToFireAnnotations.includes(message.type)) {
      this.receivedTypesThatFireAnnotations[message.url]
        ? this.receivedTypesThatFireAnnotations[message.url]++
        : (this.receivedTypesThatFireAnnotations[message.url] = 1);
    }

    // First catch if we are running Browsertime and/or WebPageTest
    if (message.type === 'browsertime.setup') {
      this.usingBrowsertime = true;
      this.messageTypesToFireAnnotations.push('browsertime.pageSummary');
    } else if (message.type === 'webpagetest.setup') {
      this.messageTypesToFireAnnotations.push('webpagetest.pageSummary');
    } else if (message.type === 'sitespeedio.setup') {
      // Let other plugins know that the Grafana plugin is alive
      queue.postMessage(this.make('grafana.setup'));
    } else if (message.type === 'influxdb.setup') {
      // Default we use Graphite config, else use influxdb
      this.tsdbType = 'influxdb';
    } else if (message.type === 'browsertime.config') {
      if (message.data.screenshot) {
        this.useScreenshots = message.data.screenshot;
        this.screenshotType = message.data.screenshotType;
      }
    } else if (message.type === 'browsertime.alias') {
      this.alias[message.url] = message.data;
    } else if (
      this.receivedTypesThatFireAnnotations[message.url] ===
        this.messageTypesToFireAnnotations.length &&
      this.resultUrls.hasBaseUrl()
    ) {
      const absolutePagePath = this.resultUrls.absoluteSummaryPageUrl(
        message.url
      );
      this.receivedTypesThatFireAnnotations[message.url] = 0;
      return sendAnnotations.send(
        message.url,
        message.group,
        absolutePagePath,
        this.useScreenshots,
        this.screenshotType,
        this.timestamp,
        this.tsdbType,
        this.alias,
        this.wptExtras[message.url],
        this.usingBrowsertime,
        this.options
      );
    }
  },
  config: defaultConfig
};
