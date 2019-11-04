'use strict';

const HTMLBuilder = require('./htmlBuilder');
const get = require('lodash.get');
const set = require('lodash.set');
const reduce = require('lodash.reduce');
const DataCollector = require('./dataCollector');
const renderer = require('./renderer');

// lets keep this in the HTML context, since we need things from the
// regular options object in the output
const defaultConfig = {
  html: {
    showAllWaterfallSummary: false,
    pageSummaryMetrics: [
      'transferSize.total',
      'requests.total',
      'thirdParty.requests',
      'transferSize.javascript',
      'transferSize.css',
      'transferSize.image',
      'score.performance'
    ],
    summaryBoxes: [
      'score.score',
      'score.accessibility',
      'score.bestpractice',
      'score.privacy',
      'score.performance',
      'timings.firstPaint',
      'timings.fullyLoaded',
      'timings.pageLoadTime',
      'timings.FirstVisualChange',
      'timings.LastVisualChange',
      'timings.SpeedIndex',
      'timings.PerceptualSpeedIndex',
      'timings.VisualReadiness',
      'timings.VisualComplete95',
      'requests.total',
      'requests.html',
      'requests.javascript',
      'requests.css',
      'requests.font',
      'requests.httpErrors',
      'transferSize.total',
      'transferSize.html',
      'transferSize.javascript',
      'transferSize.css',
      'transferSize.image',
      'transferSize.font',
      'transferSize.favicon',
      'transferSize.json',
      'transferSize.other',
      'transferSize.plain',
      'transferSize.svg',
      'contentSize.total',
      'contentSize.html',
      'contentSize.javascript',
      'contentSize.css',
      'contentSize.image',
      'contentSize.font',
      'contentSize.favicon',
      'contentSize.json',
      'contentSize.other',
      'contentSize.plain',
      'contentSize.svg',
      'thirdParty.transferSize',
      'thirdParty.requests',
      'lighthouse.performance',
      'lighthouse.accessibility',
      'lighthouse.best-practices',
      'lighthouse.seo',
      'lighthouse.pwa',
      'webpagetest.SpeedIndex',
      'webpagetest.lastVisualChange',
      'webpagetest.render',
      'webpagetest.visualComplete',
      'webpagetest.visualComplete95',
      'webpagetest.TTFB',
      'webpagetest.fullyLoaded',
      'gpsi.speedscore',
      'axe.critical',
      'axe.serious',
      'axe.minor',
      'axe.moderate',
      'cpu.longTasksTotalDuration',
      'cpu.longTasks'
    ]
  }
};

module.exports = {
  open(context, options) {
    this.make = context.messageMaker('html').make;
    // we have to overwrite the default summary metrics, if given
    // instead of recursively merging the cli array param
    this.options = Object.assign({}, defaultConfig, options);
    this.HTMLBuilder = new HTMLBuilder(context, this.options);
    this.dataCollector = new DataCollector(context.resultUrls);
    this.maxAssets = get(options, 'maxAssets', 20);
    this.alias = {};
    this.context = context;
    // we have a couple of default regitered datatypes
    this.collectDataFrom = [
      'browsertime.run',
      'browsertime.console',
      'browsertime.pageSummary',
      'pagexray.run',
      'pagexray.pageSummary',
      'coach.run',
      'coach.pageSummary',
      'webpagetest.run',
      'webpagetest.pageSummary',
      'thirdparty.run',
      'thirdparty.pageSummary'
    ];
  },
  processMessage(message, queue) {
    const dataCollector = this.dataCollector;
    const make = this.make;

    // If this type is registered
    if (this.collectDataFrom.indexOf(message.type) > -1) {
      dataCollector.addDataForUrl(
        message.url,
        message.type,
        message.data,
        message.runIndex
      );
    } else {
      switch (message.type) {
        case 'error': {
          dataCollector.addErrorForUrl(
            message.url,
            message.source,
            message.data
          );
          break;
        }
        // we always want to add data from our HARs
        case 'webpagetest.har':
        case 'browsertime.har': {
          dataCollector.addDataForUrl(
            message.url,
            message.type,
            message.data,
            message.runIndex
          );
          break;
        }

        case 'html.pug': {
          // we got a pug from plugins, let compile and cache them
          renderer.addTemplate(message.data.id, message.data.pug);
          // and also keep the types so we can render them
          this.HTMLBuilder.addType(
            message.data.id,
            message.data.name,
            message.data.type
          );
          // make sure we pickup the data for this pug
          this.collectDataFrom.push(message.data.id + '.' + message.data.type);
          break;
        }

        case 'browsertime.alias': {
          this.alias[message.url] = message.data;
          break;
        }

        case 'html.css': {
          this.HTMLBuilder.addInlineCSS(message.data);
          break;
        }

        case 'aggregateassets.summary': {
          if (message.group === 'total') {
            const assetList = reduce(
              message.data,
              (assetList, asset) => {
                assetList.push(asset);
                return assetList;
              },
              []
            );

            const count = this.maxAssets,
              fullCount = Object.keys(assetList).length,
              topAssets = assetList
                .sort((a, b) => b.requestCount - a.requestCount)
                .splice(0, count);
            dataCollector.addSummary('assets', {
              topAssets,
              count,
              fullCount
            });
          }
          break;
        }

        case 'largestassets.summary': {
          if (message.group === 'total') {
            const assetsBySize = {};
            for (const contentType of Object.keys(message.data)) {
              assetsBySize[contentType] = message.data[contentType];
              dataCollector.addSummary('toplist', {
                assetsBySize
              });
            }
          }
          break;
        }
        case 'largestthirdpartyassets.summary': {
          if (message.group === 'total') {
            dataCollector.addSummary('toplist', {
              thirdPartyAssetsBySize: message.data
            });
          }
          break;
        }
        case 'slowestassets.summary': {
          if (message.group === 'total') {
            const slowestAssets = message.data;
            dataCollector.addSummary('toplist', {
              slowestAssets
            });
          }
          break;
        }

        case 'slowestthirdpartyassets.summary': {
          if (message.group === 'total') {
            dataCollector.addSummary('toplist', {
              thirdPartySlowestAssets: message.data
            });
          }
          break;
        }

        case 'domains.summary': {
          if (message.group === 'total') {
            const domainList = reduce(
              message.data,
              (domainList, domainStats) => {
                domainList.push(domainStats);
                return domainList;
              },
              []
            );

            const count = 200,
              fullCount = domainList.length,
              topDomains = domainList
                .sort((a, b) => b.requestCount - a.requestCount)
                .splice(0, count);
            dataCollector.addSummary('domains', {
              topDomains,
              count,
              fullCount
            });
          }
          break;
        }
        case 'webpagetest.summary':
        case 'coach.summary':
        case 'pagexray.summary':
        case 'browsertime.summary':
        case 'axe.summary': {
          if (message.group === 'total') {
            const data = {};
            set(data, message.type, message.data);
            dataCollector.addSummary('index', data);
            dataCollector.addSummary('detailed', data);
          }
          break;
        }
        case 'browsertime.config': {
          if (message.data.screenshot === true) {
            dataCollector.useBrowsertimeScreenshots(
              message.data.screenshotType
            );
          }
          break;
        }
        case 'sitespeedio.render': {
          return this.HTMLBuilder.render(dataCollector).then(() => {
            queue.postMessage(make('html.finished'));
          });
        }
      }
    }
  },
  config: defaultConfig
};
