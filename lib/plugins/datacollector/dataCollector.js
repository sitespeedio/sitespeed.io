'use strict';

const fs = require('fs'),
  Promise = require('bluebird'),
  merge = require('lodash.merge'),
  get = require('lodash.get'),
  set = require('lodash.set');

Promise.promisifyAll(fs);

class DataCollector {
  constructor(context) {
    this.resultUrls = context.resultUrls;
    this.urlRunPages = context.dataCollection.urlRunPages;
    this.urlPages = context.dataCollection.urlPages;
    this.summaryPages = context.dataCollection.summaryPages;
  }

  _addUrl(url) {
    if (!this.urlPages[url]) {
      this.urlPages[url] = {
        path: this.resultUrls.relativeSummaryPageUrl(url),
        data: {}
      };
      this.urlRunPages[url] = [];
    }
  }

  addErrorForUrl(url, source, data) {
    this._addUrl(url);

    const errors = get(this.urlPages[url], 'errors', {});
    errors[source] = data;
    set(this.urlPages[url], 'errors', errors);
  }

  addDataForUrl(url, typePath, data, runIndex) {
    this._addUrl(url);

    if (runIndex !== undefined) {
      let runData = this.urlRunPages[url][runIndex] || {
        runIndex,
        data: {}
      };
      set(runData.data, typePath, data);
      this.urlRunPages[url][runIndex] = runData;
    } else {
      set(this.urlPages[url].data, typePath, data);
    }
  }

  addDataForSummaryPage(name, data) {
    if (this.summaryPages[name]) {
      merge(this.summaryPages[name], data);
    } else {
      set(this.summaryPages, name, merge({}, data));
    }
  }
}

module.exports = DataCollector;
