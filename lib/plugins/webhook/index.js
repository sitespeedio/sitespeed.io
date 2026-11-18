import { getLogger } from '@sitespeed.io/log';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

import { send } from './send.js';
import { throwIfMissing } from '../../support/util.js';

const log = getLogger('sitespeedio.plugin.webhook');

function medians(statistics = {}) {
  const result = {};
  for (const metric of Object.keys(statistics)) {
    result[metric] = statistics[metric].median;
  }
  return result;
}

export default class WebhookPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'webhook', options, context, queue });
  }

  open(context, options) {
    throwIfMissing(options.webhook, ['url'], 'webhook');
    this.url = options.webhook.url;
    this.name = options.name;
    this.resultUrls = context.resultUrls;
    this.alias = {};
    this.pages = [];
  }

  processMessage(message) {
    switch (message.type) {
      case 'browsertime.browser': {
        this.browser = message.data.browser;
        break;
      }
      case 'browsertime.alias': {
        this.alias[message.url] = message.data;
        break;
      }
      case 'browsertime.pageSummary': {
        const alias = this.alias[message.url];
        this.pages.push({
          url: message.url,
          alias,
          resultUrl: this.resultUrls.hasBaseUrl()
            ? this.resultUrls.absoluteSummaryPageUrl(message.url, alias) +
              'index.html'
            : undefined,
          googleWebVitals: medians(message.data.statistics.googleWebVitals)
        });
        break;
      }
      case 'budget.result': {
        this.budget = message.data;
        break;
      }
    }
  }

  // close runs after the HTML is written and uploaded, so the result URLs work
  async close(options, errors) {
    const payload = {
      name: this.name,
      resultUrl: this.resultUrls.hasBaseUrl()
        ? this.resultUrls.reportSummaryUrl() + '/index.html'
        : undefined,
      browser: this.browser,
      pages: this.pages,
      budget: this.budget,
      errors
    };
    try {
      await send(this.url, payload);
      log.info('Sent the result to the webhook');
    } catch (error) {
      log.error('Could not send the result to the webhook', error);
    }
  }
}
