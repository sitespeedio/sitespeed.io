'use strict';
const merge = require('lodash.merge'),
  set = require('lodash.set'),
  reduce = require('lodash.reduce'),
  summaryBoxesSetup = require('./setup/summaryBoxes'),
  detailedSetup = require('./setup/detailed');

class DataCollection {
  constructor() {
    this.summaryPages = {};
    this.urlPages = {};
    this.urlRunPages = {};
  }

  addDataForSummaryPage(name, data) {
    if (this.summaryPages[name]) {
      merge(this.summaryPages[name], data);
    } else {
      set(this.summaryPages, name, merge({}, data));
    }
  }

  getSummaryBoxes() {
    return summaryBoxesSetup(this.summaryPages['index']);
  }

  getDetailedBoxes() {
    return detailedSetup(this.summaryPages['detailed']);
  }

  getValidPages() {
    return reduce(this.urlPages, (validPages, urlInfo, url) => {
      if (Object.keys(urlInfo.data).length > 0) {
        validPages[url] = urlInfo;
      }
      return validPages;
    }, {});
  }

  getErrorPages() {
    return reduce(this.urlPages, (errors, urlInfo, url) => {
      if (urlInfo.errors) {
        errors[url] = urlInfo.errors;
      }
      return errors;
    }, {});
  }

}

module.exports = DataCollection;
