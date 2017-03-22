'use strict';

const urlParser = require('url');
const pathToFolder = require('./pathToFolder');

module.exports = function resultUrls(resultBaseUrl) {
  return {
    hasBaseUrl() {
      return !!resultBaseUrl;
    },
    reportSummaryUrl() {
      return resultBaseUrl;
    },
    absoluteSummaryPageUrl(url) {
      const pageUrl = urlParser.parse(resultBaseUrl);
      pageUrl.pathname = [pageUrl.pathname, pathToFolder(url)].join('/');
      return urlParser.format(pageUrl);
    },
    relativeSummaryPageUrl(url) {
      return pathToFolder(url);
    }
  };
};
