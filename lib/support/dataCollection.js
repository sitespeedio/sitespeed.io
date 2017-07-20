'use strict';
const reduce = require('lodash.reduce'),
  summaryBoxesSetup = require('./setup/summaryBoxes'),
  detailedSetup = require('./setup/detailed');

class DataCollection {
  constructor() {
    this.summaryPages = {};
    this.urlPages = {};
    this.urlRunPages = {};
  }

  getSummaryBoxes() {
    return summaryBoxesSetup(this.summaryPages['index']);
  }

  getDetailedBoxes() {
    return detailedSetup(this.summaryPages['detailed']);
  }

  getValidPages() {
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

  getErrorPages() {
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
}

module.exports = DataCollection;
