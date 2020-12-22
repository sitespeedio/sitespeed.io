'use strict';

const urlParser = require('url');
const pathToFolder = require('./pathToFolder');

function getPageUrl({ url, resultBaseUrl, options, alias }) {
  const pageUrl = urlParser.parse(resultBaseUrl);
  pageUrl.pathname = [pageUrl.pathname, pathToFolder(url, options, alias)].join(
    '/'
  );
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
    absoluteSummaryPageUrl(url, alias) {
      return getPageUrl({ url, resultBaseUrl, options, alias });
    },
    absoluteSummaryPagePath(url, alias) {
      return getPageUrl({ url, resultBaseUrl, options, alias });
    },
    relativeSummaryPageUrl(url, alias) {
      return pathToFolder(url, options, alias);
    }
  };
};
