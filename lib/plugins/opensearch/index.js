import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import { getLogger } from '@sitespeed.io/log';
import { Client } from '@opensearch-project/opensearch';

const log = getLogger('sitespeedio.plugin.opensearch');

export default class OpenSearchPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'opensearch', options, context, queue });
  }

  open(context, options) {
    this.opensearchOptions = options.opensearch;
    this.index = this.opensearchOptions?.index;
    this.options = options;
    this.make = context.messageMaker('opensearch').make;
    this.storageManager = context.storageManager;
    
    // Initialize OpenSearch client connection
    // Register a logger for this plugin, a unique name so we can filter the log
    // And save the log for later
    this.log = context.getLogger('sitespeedio.plugin.opensearch');
    this.log.info('Plugin opensearch started');
    this.initializeClient();
  }

  initializeClient() {
    const {
      host,
      port,
      protocol,
      auth
    } = this.opensearchOptions || {};

    if (!host || !port) {
      throw new Error('OpenSearch host and port must be defined');
    }

    this.client = new Client({
      node: `${protocol}://${host}:${port}`,
      auth: auth?.username
        ? {
            username: auth.username,
            password: auth.password
          }
        : undefined,
      ssl: {
        rejectUnauthorized: false
      }
    });

    log.info(`Connected to ${protocol}://${host}:${port}`);
  }

  async processMessage(message, queue) {

    if (message.type === 'browsertime.pageSummary') {
      //log.info('Received browsertime.pageSummary message data:');
      //log.info(JSON.stringify(message.data, null, 2));

      try {
        await this.sendMetricsToOpenSearch(message.data);
      } catch (error) {
        log.error('Failed to send metrics to OpenSearch', error);
      }
    }
  }

  async sendMetricsToOpenSearch(data) {

    const document = this.transformMetrics(data);

    try {
      const response = await this.client.index({
        index: this.index,
        body: document,
        refresh: false
      });

      log.info(`Indexed into ${this.index} id=${response.body?._id}`);

    } catch (err) {
      log.error('OpenSearch indexing failed');
      log.error(JSON.stringify(err.meta?.body, null, 2));
      throw err;
    }
  }

  transformMetrics(data) {
    const webVitals = data.googleWebVitals?.[0] || {};
    const browserTimings =
      data.browserScripts?.[0]?.timings?.pageTimings || {};

    return {
      timestamp: new Date().toISOString(),
      url: data.info?.url || 'unknown',

      lcp: webVitals.largestContentfulPaint ?? 0,
      cls: webVitals.cumulativeLayoutShift ?? 0,

      browserpbbackendtime: browserTimings.backEndTime ?? 0,
      browserpbdomcontentloadedtime:
        browserTimings.domContentLoadedTime ?? 0,
      browserpbdominteractivetime:
        browserTimings.domInteractiveTime ?? 0,
      browserpbdomainlookuptime:
        browserTimings.domainLookupTime ?? 0,
      browserpbfrontEndTime:
        browserTimings.frontEndTime ?? 0,
      browserpbpageLoadTime:
        browserTimings.pageLoadTime ?? 0,
      browserpbserverConnectionTime:
        browserTimings.serverConnectionTime ?? 0,
      browserpbserverResponseTime:
        browserTimings.serverResponseTime ?? 0
    };
  }
}
