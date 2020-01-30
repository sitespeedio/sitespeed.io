'use strict';

const urlParser = require('url');
const pathToFolder = require('./pathToFolder');

function getPageUrl({ url, resultBaseUrl, useHash }) {
  const pageUrl = urlParser.parse(resultBaseUrl);
  pageUrl.pathname = [pageUrl.pathname, pathToFolder(url, useHash)].join('/');
  return urlParser.format(pageUrl);
}

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
      return getPageUrl({ url, resultBaseUrl, useHash });
    },
    absoluteSummaryPagePath(url) {
      return getPageUrl({ url, resultBaseUrl, useHash });
    },
    relativeSummaryPageUrl(url) {
      return pathToFolder(url, useHash);
    }
  };
};
