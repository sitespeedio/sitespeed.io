import dayjs from 'dayjs';

import { SitespeedioPlugin } from '@sitespeed.io/plugin';

import { send } from './send-annotation.js';
import { throwIfMissing } from '../../support/util.js';

export default class GrafanaPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'grafana', options, context, queue });
  }

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
  }

  processMessage(message, queue) {
    if (this.messageTypesToFireAnnotations.includes(message.type)) {
      this.receivedTypesThatFireAnnotations[message.url]
        ? this.receivedTypesThatFireAnnotations[message.url]++
        : (this.receivedTypesThatFireAnnotations[message.url] = 1);
    }

    // First catch if we are running Browsertime and/or WebPageTest
    switch (message.type) {
      case 'browsertime.setup': {
        this.usingBrowsertime = true;
        this.messageTypesToFireAnnotations.push('browsertime.pageSummary');

        break;
      }
      case 'sitespeedio.setup': {
        // Let other plugins know that the Grafana plugin is alive
        queue.postMessage(this.make('grafana.setup'));

        break;
      }
      case 'influxdb.setup': {
        // Default we use Graphite config, else use influxdb
        this.tsdbType = 'influxdb';

        break;
      }
      case 'browsertime.config': {
        if (message.data.screenshot) {
          this.useScreenshots = message.data.screenshot;
          this.screenshotType = message.data.screenshotType;
        }

        break;
      }
      case 'browsertime.browser': {
        this.browser = message.data.browser;

        break;
      }
      default: {
        if (message.type === 'browsertime.alias') {
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

          const timestamp =
            message.type === 'browsertime.pageSummary'
              ? dayjs(message.runTime)
              : this.timestamp;

          return send(
            message.url,
            message.group,
            absolutePagePath,
            this.useScreenshots,
            this.screenshotType,
            timestamp,
            this.tsdbType,
            this.alias,
            this.wptExtras[message.url],
            this.usingBrowsertime,
            this.browser,
            this.options
          );
        }
      }
    }
  }
}
