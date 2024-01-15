import { parse } from 'node:url';
import intel from 'intel';
import coach from 'coach-core';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

import { PageXrayAggregator } from './pagexrayAggregator.js';
import { short } from '../../support/helpers/index.js';

const { getPageXray } = coach;
const pagexray = getPageXray();
const log = intel.getLogger('plugin.pagexray');

const DEFAULT_PAGEXRAY_PAGESUMMARY_METRICS = [
  'contentTypes',
  'transferSize',
  'contentSize',
  'requests',
  'firstParty',
  'thirdParty',
  'responseCodes',
  'expireStats',
  'totalDomains',
  'lastModifiedStats',
  'cookies'
];
const DEFAULT_PAGEXRAY_SUMMARY_METRICS = [
  'contentTypes',
  'transferSize',
  'contentSize',
  'requests',
  'firstParty',
  'thirdParty',
  'responseCodes',
  'expireStats',
  'domains',
  'lastModifiedStats',
  'cookies'
];

const DEFAULT_PAGEXRAY_RUN_METRICS = [];

export default class PageXrayPlugin extends SitespeedioPlugin {
  constructor(options, context) {
    super({ name: 'pagexray', options, context });
  }

  open(context, options) {
    this.options = options;
    this.make = context.messageMaker('pagexray').make;

    this.pageXrayAggregator = new PageXrayAggregator();

    context.filterRegistry.registerFilterForType(
      DEFAULT_PAGEXRAY_PAGESUMMARY_METRICS,
      'pagexray.pageSummary'
    );
    context.filterRegistry.registerFilterForType(
      DEFAULT_PAGEXRAY_SUMMARY_METRICS,
      'pagexray.summary'
    );
    context.filterRegistry.registerFilterForType(
      DEFAULT_PAGEXRAY_RUN_METRICS,
      'pagexray.run'
    );

    this.usingWebpagetest = false;
    this.usingBrowsertime = false;
    this.multi = options.multi;
  }
  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'browsertime.setup': {
        this.usingBrowsertime = true;
        break;
      }
      case 'webpagetest.setup': {
        this.usingWebpagetest = true;
        break;
      }
      case 'webpagetest.har':
      case 'browsertime.har': {
        if (
          (this.usingBrowsertime && message.type === 'browsertime.har') ||
          (!this.usingBrowsertime && this.usingWebpagetest)
        ) {
          const group = message.group;
          let config = {
            includeAssets: true,
            firstParty: this.options.firstParty ?? undefined
          };
          const pageSummary = pagexray.convert(message.data, config);
          //check and print any http server error > 399
          for (let summary of pageSummary) {
            if (Object.keys(summary.responseCodes).some(code => code > 399)) {
              for (let asset of summary.assets) {
                if (asset.status > 399) {
                  log.info(
                    `The server responded with a ${
                      asset.status
                    } status code for ${short(asset.url, 60)}`
                  );
                }
              }
            }
          }
          this.pageXrayAggregator.addToAggregate(
            pageSummary,
            group,
            message.url
          );
          if (this.multi) {
            // The HAR file can have multiple URLs
            const sentURL = {};
            for (let summary of pageSummary) {
              // The group can be different so take it per url
              const myGroup = parse(summary.url).hostname;
              if (sentURL[summary.url]) {
                sentURL[summary.url] += 1;
              } else {
                sentURL[summary.url] = 1;
                summary.statistics = this.pageXrayAggregator.summarizePerUrl(
                  summary.url
                );
                queue.postMessage(
                  make('pagexray.pageSummary', summary, {
                    url: summary.url,
                    group: myGroup
                  })
                );
              }
              // Send each individual run too
              queue.postMessage(
                make('pagexray.run', summary, {
                  url: summary.url,
                  group: myGroup,
                  runIndex: sentURL[summary.url] - 1,
                  iteration: sentURL[summary.url]
                })
              );
            }
          } else {
            pageSummary[0].statistics = this.pageXrayAggregator.summarizePerUrl(
              message.url
            );
            queue.postMessage(
              make('pagexray.pageSummary', pageSummary[0], {
                url: message.url,
                group // TODO get the group from the URL?
              })
            );
            let iteration = 1;
            for (let summary of pageSummary) {
              queue.postMessage(
                make('pagexray.run', summary, {
                  url: message.url,
                  group,
                  runIndex: iteration - 1,
                  iteration
                })
              );
              iteration++;
            }
          }
        }
        break;
      }

      case 'sitespeedio.summarize': {
        log.debug('Generate summary metrics from PageXray');
        let pagexraySummary = this.pageXrayAggregator.summarize();
        if (pagexraySummary) {
          for (let group of Object.keys(pagexraySummary.groups)) {
            queue.postMessage(
              make('pagexray.summary', pagexraySummary.groups[group], { group })
            );
          }
        }
        break;
      }
    }
  }
}
