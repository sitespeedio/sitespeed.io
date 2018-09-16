'use strict';

const urlParser = require('url');
const pathToFolder = require('./pathToFolder');

module.exports = function resultUrls(resultBaseUrl, useHash) {
  return {
    hasBaseUrl() {
      return !!resultBaseUrl;
    },
    reportSummaryUrl() {
      return resultBaseUrl;
    },
    // In the future this one shoudl include the full URL including /index.html
    absoluteSummaryPageUrl(url) {
      const pageUrl = urlParser.parse(resultBaseUrl);
      pageUrl.pathname = [pageUrl.pathname, pathToFolder(url, useHash)].join(
        '/'
      );
      return urlParser.format(pageUrl);
    },
    absoluteSummaryPagePath(url) {
      const pageUrl = urlParser.parse(resultBaseUrl);
      pageUrl.pathname = [pageUrl.pathname, pathToFolder(url)].join('/');
      return urlParser.format(pageUrl);
    },
    relativeSummaryPageUrl(url) {
      return pathToFolder(url, useHash);
    }
  };
};
