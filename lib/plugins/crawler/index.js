import path from 'node:path';
import merge from 'lodash.merge';
import { getLogger } from '@sitespeed.io/log';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

const log = getLogger('sitespeedio.plugin.crawler');
import Crawler from 'simplecrawler';
import { throwIfMissing } from '../../support/util.js';
import { toArray } from '../../support/util.js';

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

      return new Promise(resolve => {
        const redirectedUrls = new Set(),
          crawler = new Crawler(message.url);

        let pageCount = 1; // First page is start url

        crawler.maxDepth = this.options.depth;
        crawler.downloadUnsupported = false;
        crawler.allowInitialDomainChange = true;
        crawler.parseHTMLComments = false;

        if (this.options.ignoreRobotsTxt) {
          log.info('Crawler: Ignoring robots.txt');
          crawler.respectRobotsTxt = false;
        }

        if (this.cookie) {
          const cookies = toArray(this.cookie);
          for (let cookieParts of cookies) {
            const parts = new Array(
              cookieParts.slice(0, cookieParts.indexOf('=')),
              cookieParts.slice(cookieParts.indexOf('=') + 1)
            );
            crawler.cookies.add(parts[0], parts[1]);
          }
        }

        crawler.addFetchCondition(queueItem => {
          const extension = path.extname(queueItem.path);
          // Don't try to download these, based on file name.
          if (['png', 'jpg', 'gif', 'pdf'].includes(extension)) {
            return false;
          }

          if (this.options.include) {
            for (let e of this.options.include) {
              if (!e.test(queueItem.url)) {
                log.verbose(
                  'Crawler skipping %s, matches need to include pattern %s',
                  queueItem.url,
                  e
                );
                return false;
              }
            }
          }

          if (this.options.exclude) {
            for (let e of this.options.exclude) {
              if (e.test(queueItem.url)) {
                log.verbose(
                  'Crawler skipping %s, matches exclude pattern %s',
                  queueItem.url,
                  e
                );
                return false;
              }
            }
          }

          return true;
        });

        if (this.basicAuth) {
          const userAndPassword = this.basicAuth.split('@');
          crawler.needsAuth = true;
          crawler.authUser = userAndPassword[0];
          crawler.authPass = userAndPassword[1];
        }

        if (this.userAgent) {
          crawler.userAgent = this.userAgent;
        }

        crawler.on('fetchconditionerror', (queueItem, error) => {
          log.warn(
            'An error occurred in the fetchCondition callback: %s',
            error
          );
        });

        crawler.on('fetchredirect', (queueItem, parsedURL, response) => {
          redirectedUrls.add(response.headers.location);
        });

        crawler.on('fetchcomplete', queueItem => {
          const pageMimeType = /^(text|application)\/x?html/i;

          const url = queueItem.url;
          if (redirectedUrls.has(url)) {
            log.verbose('Crawler skipping redirected URL %s', url);
          } else if (message.url === url) {
            log.verbose('Crawler skipping initial URL %s', url);
          } else if (pageMimeType.test(queueItem.stateData.contentType)) {
            log.verbose('Crawler found %s URL %s', pageCount, url);
            queue.postMessage(make('url', {}, { url, group: message.group }));
            pageCount++;

            if (pageCount >= maxPages) {
              log.info('Crawler stopped after %d urls', pageCount);
              crawler.stop(true);
              return resolve();
            }
          } else {
            log.verbose('Crawler found non html URL %s', url);
          }
        });

        crawler.on('complete', resolve);

        log.info(
          'Starting to crawl from ' +
            message.url +
            ' with max depth ' +
            crawler.maxDepth +
            ' and max count ' +
            maxPages
        );
        crawler.start();
      });
    }
  }
}
