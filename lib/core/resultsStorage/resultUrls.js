'use strict';

const urlParser = require('url');
const pathToFolder = require('./pathToFolder');

function getPageUrl({ url, resultBaseUrl, options }) {
  const pageUrl = urlParser.parse(resultBaseUrl);
  pageUrl.pathname = [pageUrl.pathname, pathToFolder(url, options)].join('/');
  return urlParser.format(pageUrl);
}

module.exports = function resultUrls(resultBaseUrl, options) {
  return {
    hasBaseUrl() {
      return !!resultBaseUrl;
    },
    reportSummaryUrl() {
      return resultBaseUrl;
    },
    // In the future this one shoudl include the full URL including /index.html
    absoluteSummaryPageUrl(url) {
      return getPageUrl({ url, resultBaseUrl, options });
    },
    absoluteSummaryPagePath(url) {
      return getPageUrl({ url, resultBaseUrl, options });
    },
    relativeSummaryPageUrl(url) {
      return pathToFolder(url, options);
    }
  };
};
