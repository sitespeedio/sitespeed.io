'use strict';
const path = require('path');
const sendAnnotations = require('./send-annotation');
const tsdbUtil = require('../../support/tsdbUtil');
const throwIfMissing = require('../../support/util').throwIfMissing;
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
    } else if (message.type === 'browsertime.browser') {
      this.browser = message.data.browser;
    } else if (
      message.type === 'webpagetest.browser' &&
      !this.usingBrowsertime
    ) {
      // We are only interested in WebPageTest browser if we run it standalone
      this.browser = message.data.browser;
    } else if (message.type === 'browsertime.alias') {
      this.alias[message.url] = message.data;
    } else if (
      this.receivedTypesThatFireAnnotations[message.url] ===
        this.messageTypesToFireAnnotations.length &&
      this.resultUrls.hasBaseUrl()
    ) {
      const absolutePagePath = this.resultUrls.absoluteSummaryPageUrl(
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
        this.timestamp,
        this.tsdbType,
        this.alias,
        this.wptExtras[message.url],
        this.usingBrowsertime,
        this.browser,
        this.options
      );
    }
  },

  /**
   * At the time of this writing, this property's usage could be verified only by the CLI portion of the codebase.
   * Instead of introducting a breaking change in the plugin interface, this is kept.
   *
   * @todo Inspect the code base and plugin dependencies to ensure this property can be removed (if necessary)
   */
  get config() {
    return cliUtil.pluginDefaults(this.cliOptions);
  }
};
