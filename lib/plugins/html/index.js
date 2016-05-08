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
    this.HTMLBuilder = new HTMLBuilder(context.storageManager);
    this.options = options;
  },

  processMessage(message) {
    // Accumulate data from messages, and write files as needed.
    switch (message.type) {
      case 'url':
      {
        return this.HTMLBuilder.addUrl(message.url);
      }

      case 'error':
      {
        return this.HTMLBuilder.addErrorForUrl(message.url, message.data);
      }

      case 'browsertime.run':
      case 'browsertime.page':
      case 'browsertime.har':
      case 'webpagetest.run':
      case 'webpagetest.pageSummary':
      case 'gpsi.data':
      case 'pagexray.pageSummary':
      case 'pagexray.run':
      case 'coach.run':
      {
        return this.HTMLBuilder.addDataForUrl(message.url, message.type, message.data, message.runIndex);
      }

      case 'assets.aggregate':
      {
        const count = 10,
          fullCount = Object.keys(message.data).length,
          topAssets = message.data
            .sort((a, b) => b.requestCount - a.requestCount)
            .splice(0, count);
        return this.HTMLBuilder.addDataForSummaryPage('assets', {topAssets, count, fullCount});
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
      {
        const data = {};
        set(data, message.type, message.data);
        return this.HTMLBuilder.addDataForSummaryPage('index', data);
      }
    }
  },
  close() {
    return this.HTMLBuilder.renderHTML(this.options);
  }
};
