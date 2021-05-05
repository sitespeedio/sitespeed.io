'use strict';

const throwIfMissing = require('../../support/util').throwIfMissing;
const log = require('intel').getLogger('sitespeedio.plugin.webhook');
const path = require('path');
const cliUtil = require('../../cli/util');
const send = require('./send');

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  get cliOptions() {
    return require(path.resolve(__dirname, 'cli.js'));
  },
  open(context, options = {}) {
    this.webHookOptions = options.webhook || {};
    this.options = options;
    log.info('Starting the webhook plugin');
    throwIfMissing(options.webhook, ['url'], 'webhook');
    this.resultUrls = context.resultUrls;
    this.waitForUpload = false;
    this.alias = {};
    this.message = { text: '' };
    if (options.webhook) {
      for (let key of Object.keys(options.webhook)) {
        if (key !== 'url') {
          this.message[key] = options.webhook[key];
        }
      }
    }
  },
  async processMessage(message) {
    const options = this.webHookOptions;
    switch (message.type) {
      case 'browsertime.browser': {
        this.browserData = message.data;
        break;
      }
      case 'gcs.setup':
      case 'ftp.setup':
      case 's3.setup': {
        this.waitForUpload = true;
        break;
      }
      case 'browsertime.alias': {
        this.alias[message.url] = message.data;
        break;
      }
      case 'browsertime.config': {
        if (message.data.screenshot === true) {
          this.screenshotType = message.data.screenshotType;
        }
        break;
      }

      case 'gcs.finished':
      case 'ftp.finished':
      case 's3.finished':
      case 'sitespeedio.render': {
        // sitespeedio.render is just for testing purpose
        // if (this.waitForUpload) {
        const message = {
          text: this.resultUrls.reportSummaryUrl() + '/index.html'
        };
        await send(options.url, message);
        //}
        break;
      }
    }
  },
  get config() {
    return cliUtil.pluginDefaults(this.cliOptions);
  }
};
