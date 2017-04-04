'use strict';

const set = require('lodash.set');
const reduce = require('lodash.reduce');
const DataCollector = require('./dataCollector');

module.exports = {
  open(context) {
    this.dataCollector = new DataCollector(context);
  },

  processMessage(message) {
    const dataCollector = this.dataCollector;

    switch (message.type) {
      case 'error':
        {
          return dataCollector.addErrorForUrl(message.url, message.source, message.data);
        }

      case 'browsertime.run':
      case 'browsertime.pageSummary':
      case 'browsertime.har':
      case 'webpagetest.run':
      case 'webpagetest.pageSummary':
      case 'gpsi.data':
      case 'gpsi.pageSummary':
      case 'pagexray.run':
      case 'pagexray.pageSummary':
      case 'coach.run':
      case 'coach.pageSummary':
        {
          return dataCollector.addDataForUrl(message.url, message.type, message.data, message.runIndex);
        }

      case 'aggregateassets.summary':
        {
          if (message.group === 'total') {
            const assetList = reduce(message.data, (assetList, asset) => {
              assetList.push(asset);
              return assetList;
            }, []);

            const count = 20,
              fullCount = Object.keys(assetList).length,
              topAssets = assetList
              .sort((a, b) => b.requestCount - a.requestCount)
              .splice(0, count);
            return dataCollector.addDataForSummaryPage('assets', {
              topAssets,
              count,
              fullCount
            });
          } else return;
        }

      case 'largestassets.summary':
        {
          if (message.group === 'total') {
            const assetsBySize = {};
            const contentType = Object.keys(message.data)[0];
            assetsBySize[contentType] = message.data[contentType];
            return dataCollector.addDataForSummaryPage('toplist', {
              assetsBySize
            });
          } else return;
        }

      case 'slowestassets.summary':
        {
          if (message.group === 'total') {
            const slowestAssets = message.data;
            return dataCollector.addDataForSummaryPage('toplist', {
              slowestAssets
            });
          } else return;
        }

      case 'domains.summary':
        {
          if (message.group === 'total') {
            const domainList = reduce(message.data, (domainList, domainStats) => {
              domainList.push(domainStats);
              return domainList;
            }, []);

            const count = 200,
              fullCount = domainList.length,
              topDomains = domainList
              .sort((a, b) => b.requestCount - a.requestCount)
              .splice(0, count);
            return dataCollector.addDataForSummaryPage('domains', {
              topDomains,
              count,
              fullCount
            });
          } else {
            return
          }
        }
      case 'webpagetest.summary':
      case 'coach.summary':
      case 'pagexray.summary':
      case 'browsertime.summary':
        {
          const data = {};
          set(data, message.type, message.data);
          dataCollector.addDataForSummaryPage('index', data);
          return dataCollector.addDataForSummaryPage('detailed', data);
        }
    }
  },
  close() {}
};
