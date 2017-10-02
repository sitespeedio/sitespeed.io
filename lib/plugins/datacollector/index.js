'use strict';

const set = require('lodash.set');
const reduce = require('lodash.reduce');
const get = require('lodash.get');
const DataCollector = require('./dataCollector');

module.exports = {
  open(context, options) {
    this.dataCollector = new DataCollector(context);
    this.maxAssets = get(options, 'maxAssets', 20);
  },

  processMessage(message) {
    const dataCollector = this.dataCollector;
    if (
      message.type.endsWith('.run') ||
      message.type.endsWith('.pageSummary')
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
            dataCollector.addDataForSummaryPage('assets', {
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
              dataCollector.addDataForSummaryPage('toplist', {
                assetsBySize
              });
            }
          }
          break;
        }
        case 'largestthirdpartyassets.summary': {
          if (message.group === 'total') {
            dataCollector.addDataForSummaryPage('toplist', {
              thirdPartyAssetsBySize: message.data
            });
          }
          break;
        }
        case 'slowestassets.summary': {
          if (message.group === 'total') {
            const slowestAssets = message.data;
            dataCollector.addDataForSummaryPage('toplist', {
              slowestAssets
            });
          }
          break;
        }

        case 'slowestthirdpartyassets.summary': {
          if (message.group === 'total') {
            dataCollector.addDataForSummaryPage('toplist', {
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
            dataCollector.addDataForSummaryPage('domains', {
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
          if (message.group === 'total') {
            const data = {};
            set(data, message.type, message.data);
            dataCollector.addDataForSummaryPage('index', data);
            dataCollector.addDataForSummaryPage('detailed', data);
          }
          break;
        }
      }
    }
  },
  close() {}
};
