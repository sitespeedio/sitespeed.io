import { merge } from '../../support/objectPath.js';
import { getLogger } from '@sitespeed.io/log';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

import { throwIfMissing, toArray } from '../../support/util.js';
import { crawl } from './crawl.js';

const log = getLogger('sitespeedio.plugin.crawler');

const defaultOptions = {
  depth: 3
};

export default class CrawlerPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'crawler', options, context, queue });
  }

  open(context, options) {
    throwIfMissing(options.crawler, ['depth'], 'crawler');
    this.options = merge({}, defaultOptions, options.crawler);
    this.make = context.messageMaker('crawler').make;
    this.userAgent = options.browsertime
      ? options.browsertime.userAgent
      : undefined;
    this.basicAuth = options.browsertime
      ? options.browsertime.basicAuth
      : undefined;
    this.cookie = options.browsertime.cookie || undefined;
  }

  processMessage(message, queue) {
    const make = this.make;
    if (message.type === 'url' && message.source !== 'crawler') {
      const maxPages = this.options.maxPages || Number.MAX_SAFE_INTEGER;

      if (this.options.depth <= 1 || maxPages === 1) {
        return Promise.resolve();
      }

      return crawl({
        startUrl: message.url,
        depth: this.options.depth,
        maxPages,
        include: this.options.include,
        exclude: this.options.exclude,
        ignoreRobotsTxt: this.options.ignoreRobotsTxt,
        cookies: this.cookie ? toArray(this.cookie) : undefined,
        basicAuth: this.basicAuth,
        userAgent: this.userAgent,
        onPage: url =>
          queue.postMessage(make('url', {}, { url, group: message.group })),
        log
      });
    }
  }
}
