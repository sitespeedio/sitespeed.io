'use strict';
const sendAnnotations = require('./send-annotation');
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
    this.annotationType = 'webpagetest.pageSummary';
    this.tsdbType = 'graphite';
    this.make = context.messageMaker('grafana').make;
  },
  processMessage(message, queue) {
    // First catch if we are running Browsertime and/or WebPageTest
    if (message.type === 'browsertime.setup') {
      this.annotationType = 'browsertime.pageSummary';
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
    } else if (
      message.type === this.annotationType &&
      this.resultUrls.hasBaseUrl()
    ) {
      const absolutePagePath = this.resultUrls.absoluteSummaryPageUrl(
        message.url
      );
      return sendAnnotations.send(
        message.url,
        message.group,
        absolutePagePath,
        this.useScreenshots,
        this.screenshotType,
        this.timestamp,
        this.tsdbType,
        this.options
      );
    }
  },
  config: defaultConfig
};
