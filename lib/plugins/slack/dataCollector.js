import merge from 'lodash.merge';
import get from 'lodash.get';
import set from 'lodash.set';

export class DataCollector {
  constructor(context) {
    this.resultUrls = context.resultUrls;
    this.urlRunPages = {};
    this.urlPages = {};
    this.errors = {};
    this.summaryPage = {};
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

  getSummary() {
    return this.summaryPage;
  }

  getURLs() {
    return Object.keys(this.urlPages);
  }

  getURLData(url) {
    return this.urlPages[url];
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
    errors[source] = data;
    set(this.urlPages[url], 'errors', errors);
  }

  addDataForUrl(url, typePath, data, runIndex, alias) {
    this._addUrl(url, alias);
    if (runIndex === undefined) {
      set(this.urlPages[url].data, typePath, data);
    } else {
      let runData = this.urlRunPages[url][runIndex] || {
        runIndex,
        data: {}
      };
      set(runData.data, typePath, data);
      this.urlRunPages[url][runIndex] = runData;
    }
  }

  addSummary(data) {
    merge(this.summaryPage, data);
  }
}
