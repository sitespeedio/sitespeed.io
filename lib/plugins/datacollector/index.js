'use strict';

const path = require('path'),
  set = require('lodash.set'),
  reduce = require('lodash.reduce'),
  DataCollector = require('./dataCollector');

module.exports = {
  name() {
    return path.basename(__dirname);
  },

  open(context, options) {
    this.dataCollector = new DataCollector(context, options);
    this.options = options;
  },

  processMessage(message) {
    const dataCollector = this.dataCollector;

    switch (message.type) {
      case 'url':
      {
        return dataCollector.addUrl(message.url);
      }

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

      case 'assets.aggregate':
      {
        if (message.data.total) {
          const assetList = reduce(message.data.total, (assetList, asset) => {
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

      case 'assets.largest':
      {
        if (message.data.total) {
          const assetsBySize= {};
          const contentType = Object.keys(message.data.total)[0];
          assetsBySize[contentType] = message.data.total[contentType];
          return dataCollector.addDataForSummaryPage('toplist', {assetsBySize});
        }
        else return;
      }

      case 'assets.slowest':
      {
        if (message.data.total) {
          const slowestAssets = message.data.total;
          return dataCollector.addDataForSummaryPage('toplist', {slowestAssets});
        }
        else return;
      }

      case 'domains.summary':
      {
        const domainList = reduce(message.data, (domainList, domainStats) => {
          domainList.push(domainStats);
          return domainList;
        }, []);

        const count = 200,
          fullCount = domainList.length,
          topDomains = domainList
            .sort((a, b) => b.requestCount - a.requestCount)
            .splice(0, count);
        return dataCollector.addDataForSummaryPage('domains', {topDomains, count, fullCount});
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
  close() {
  }
};
