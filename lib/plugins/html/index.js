'use strict';

const merge = require('lodash.merge');
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
    showAllWaterfallSummary: false
  }
};

module.exports = {
  open(context, options) {
    this.make = context.messageMaker('html').make;
    this.options = merge({}, defaultConfig, options);
    this.HTMLBuilder = new HTMLBuilder(context, this.options);
    this.dataCollector = new DataCollector(context.resultUrls);
    this.maxAssets = get(options, 'maxAssets', 20);
  },
  processMessage(message, queue) {
    const dataCollector = this.dataCollector;
    const make = this.make;

    if (
      message.type.endsWith('.run') ||
      message.type.endsWith('.pageSummary') ||
      message.type.endsWith('.har')
    ) {
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

        case 'html.pug': {
          // we got a pug from plugins, let compile and cache them
          renderer.addTemplate(message.data.name, message.data.pug);
          // and also keep the types so we can render them
          this.HTMLBuilder.addType(message.data.type, message.data.name);
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
        case 'gpsi.summary': {
          const data = {};
          set(data, message.type, message.data);
          dataCollector.addSummary('index', data);
          dataCollector.addSummary('detailed', data);
          break;
        }
        case 'browsertime.screenshot': {
          dataCollector.useBrowsertimeScreenshots();
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
