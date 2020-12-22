'use strict';

const merge = require('lodash.merge'),
  get = require('lodash.get'),
  reduce = require('lodash.reduce'),
  set = require('lodash.set');

class DataCollector {
  constructor(resultUrls) {
    this.resultUrls = resultUrls;
    this.urlRunPages = {};
    this.urlPages = {};
    this.summaryPages = {};
    this.browsertimeScreenshots = false;
    this.errors = {};
    this.removedUrls = {};
  }

  _addUrl(url, alias) {
    if (!this.urlPages[url]) {
      this.urlPages[url] = {
        path: this.resultUrls.relativeSummaryPageUrl(url, alias),
        data: {}
      };
      this.urlRunPages[url] = [];
    }
  }

  _removeUrl(url) {
    this.removedUrls[url] = 1;
    delete this.urlRunPages[url];
    delete this.urlPages[url];
  }

  getRemovedURLs() {
    return Object.keys(this.removedUrls);
  }

  getSummary(name) {
    return this.summaryPages[name];
  }

  getURLRuns(url) {
    return this.urlRunPages[url];
  }

  getURLs() {
    return Object.keys(this.urlPages);
  }

  getURLData(url) {
    return this.urlPages[url];
  }

  getWorkingUrls() {
    return reduce(
      this.urlPages,
      (validPages, urlInfo, url) => {
        if (Object.keys(urlInfo.data).length > 0) {
          validPages[url] = urlInfo;
        }
        return validPages;
      },
      {}
    );
  }

  getErrorUrls() {
    return reduce(
      this.urlPages,
      (errors, urlInfo, url) => {
        if (urlInfo.errors) {
          errors[url] = urlInfo.errors;
        }
        return errors;
      },
      {}
    );
  }

  getErrors() {
    return this.errors;
  }

  addError(source, data) {
    if (this.errors[source]) {
      this.errors[source].push(data);
    } else {
      this.errors[source] = [data];
    }
  }

  addErrorForUrl(url, source, data, alias) {
    this._addUrl(url, alias);
    const errors = get(this.urlPages[url], 'errors', {});
    if (errors[source]) {
      errors[source].push(data);
    } else {
      errors[source] = [data];
    }
    set(this.urlPages[url], 'errors', errors);
  }

  useBrowsertimeScreenshots(screenshotType) {
    this.browsertimeScreenshots = true;
    this.browsertimeScreenshotsType = screenshotType;
  }

  addDataForUrl(url, typePath, data, runIndex, alias) {
    this._addUrl(url, alias);

    if (runIndex !== undefined) {
      let runData = this.urlRunPages[url][runIndex] || {
        iteration: runIndex + 1,
        runIndex,
        data: {}
      };
      set(runData.data, typePath, data);
      this.urlRunPages[url][runIndex] = runData;
    } else {
      set(this.urlPages[url].data, typePath, data);
    }
  }

  addSummary(name, data) {
    if (this.summaryPages[name]) {
      merge(this.summaryPages[name], data);
    } else {
      set(this.summaryPages, name, merge({}, data));
    }
  }

  addBudget(budget) {
    this.budget = budget;
  }

  getBudget() {
    return this.budget;
  }
}

module.exports = DataCollector;
