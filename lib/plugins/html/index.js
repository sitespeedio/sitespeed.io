'use strict';

const path = require('path'),
  set = require('lodash.set'),
  reduce = require('lodash.reduce'),
  HTMLBuilder = require('./htmlBuilder');

module.exports = {
  name() {
    return path.basename(__dirname);
  },

  open(context, options) {
    this.HTMLBuilder = new HTMLBuilder(context, options);
    this.options = options;
  },

  processMessage(message) {
    switch (message.type) {
      case 'url':
      {
        return this.HTMLBuilder.addUrl(message.url);
      }

      case 'error':
      {
        return this.HTMLBuilder.addErrorForUrl(message.url, message.source, message.data);
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
        return this.HTMLBuilder.addDataForUrl(message.url, message.type, message.data, message.runIndex);
      }

      case 'assets.aggregate':
      {
        const assetList = reduce(message.data, (assetList, asset) => {
          assetList.push(asset);
          return assetList;
        }, []);

        const count = 20,
          fullCount = Object.keys(assetList).length,
          topAssets = assetList
            .sort((a, b) => b.requestCount - a.requestCount)
            .splice(0, count);
        return this.HTMLBuilder.addDataForSummaryPage('assets', {topAssets, count, fullCount});
      }

      case 'assets.aggregateSizePerContentType':
      {
        if (!message.group) {
          const assetsBySize= {};
          assetsBySize[message.contentType] = message.data;
          return this.HTMLBuilder.addDataForSummaryPage('toplist', {assetsBySize});
        }
        else return;
      }

      case 'assets.slowest':
      {
        if (!message.group) {
          const slowestAssets = message.data;
          return this.HTMLBuilder.addDataForSummaryPage('toplist', {slowestAssets});
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
        return this.HTMLBuilder.addDataForSummaryPage('domains', {topDomains, count, fullCount});
      }

      case 'webpagetest.summary':
      case 'coach.summary':
      case 'pagexray.summary':
      case 'browsertime.summary':
      {
        const data = {};
        set(data, message.type, message.data);
        this.HTMLBuilder.addDataForSummaryPage('index', data);
        return this.HTMLBuilder.addDataForSummaryPage('detailed', data);
      }
    }
  },
  close() {
    return this.HTMLBuilder.renderHTML(this.options);
  }
};
