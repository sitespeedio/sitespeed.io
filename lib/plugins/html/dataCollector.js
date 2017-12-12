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

  addErrorForUrl(url, source, data) {
    this._addUrl(url);

    const errors = get(this.urlPages[url], 'errors', {});
    errors[source] = data;
    set(this.urlPages[url], 'errors', errors);
  }

  useBrowsertimeScreenshots(screenshotType) {
    this.browsertimeScreenshots = true;
    this.browsertimeScreenshotsType = screenshotType;
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

  addSummary(name, data) {
    if (this.summaryPages[name]) {
      merge(this.summaryPages[name], data);
    } else {
      set(this.summaryPages, name, merge({}, data));
    }
  }
}

module.exports = DataCollector;
