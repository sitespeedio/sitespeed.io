'use strict';

const merge = require('lodash.merge'),
  get = require('lodash.get'),
  set = require('lodash.set');

class DataCollector {
  constructor(context) {
    this.resultUrls = context.resultUrls;
    this.urlRunPages = {};
    this.urlPages = {};
    this.summaryPage = {};
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

  getSummary() {
    return this.summaryPage;
  }

  getURLs() {
    return Object.keys(this.urlPages);
  }

  getURLData(url) {
    return this.urlPages[url];
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

  addSummary(data) {
    merge(this.summaryPage, data);
  }
}

module.exports = DataCollector;
