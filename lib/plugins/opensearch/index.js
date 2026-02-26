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

    //for (const key of Object.keys(data)) {
    //  log.info(`key: ${key}, value: ${JSON.stringify(data[key])}`);
    //}
    
    return {
      timestamp: new Date().toISOString(),
      url: data.info.url || 'unknown',
      //medianLoad: data.statistics?.median?.firstView || 0,
      //p95Load: data.statistics?.p95?.firstView || 0,
      lcp: data.googleWebVitals[0].largestContentfulPaint || 0,
      cls: data.googleWebVitals[0].cumulativeLayoutShift || 0,
      //Getting browser metrics
      browserpbbackendtime: data.browserScripts[0].timings?.pageTimings?.backEndTime || 0,
      browserpbdomcontentloadedtime: data.browserScripts[0].timings?.pageTimings?.domContentLoadedTime || 0,
      browserpbdominteractivetime: data.browserScripts[0].timings?.pageTimings?.domInteractiveTime || 0,
      browserpbdomainlookuptime: data.browserScripts[0].timings?.pageTimings?.domainLookupTime || 0,
      browserpbfrontEndTime: data.browserScripts[0].timings?.pageTimings?.frontEndTime || 0,
      browserpbpageLoadTime: data.browserScripts[0].timings?.pageTimings?.pageLoadTime || 0,
      browserpbserverConnectionTime: data.browserScripts[0].timings?.pageTimings?.serverConnectionTime || 0,
      browserpbserverResponseTime: data.browserScripts[0].timings?.pageTimings?.serverResponseTime || 0,
      coachTotalPageRequests: data.browserScripts[0].coach?.coachAdvice?.advice?.info?.pageRequests || 0
    };
  }
}
