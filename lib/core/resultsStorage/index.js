'use strict';

const urlParser = require('url');
const path = require('path');
const dayjs = require('dayjs');
const resultUrls = require('./resultUrls');
const storageManager = require('./storageManager');

const roundDownTo = roundTo => x => Math.floor(x / roundTo) * roundTo;
const roundDownTo10Minutes = roundDownTo(1000 * 60 * 10);

function getDomainOrFileName(input) {
  let domainOrFile = input;
  if (domainOrFile.startsWith('http')) {
    domainOrFile = urlParser.parse(domainOrFile).hostname;
  } else {
    domainOrFile = path.basename(domainOrFile).replace(/\./g, '_');
  }
  return domainOrFile;
}

module.exports = function(input, timestamp, options) {
  const outputFolder = options.outputFolder;
  const resultBaseURL = options.resultBaseURL;
  const resultsSubFolders = [];
  let storageBasePath;
  let storagePathPrefix;
  let resultUrl = undefined;

  if (outputFolder) {
    resultsSubFolders.push(path.basename(outputFolder));
    storageBasePath = path.resolve(outputFolder);
  } else {
    if (options.experimentalNewSetup) {
      const ten = dayjs(roundDownTo10Minutes(timestamp.valueOf()));
      resultsSubFolders.push(
        options.slug || getDomainOrFileName(input),
        ten.format('YYYY-MM-DD-HH-mm')
      );
    } else {
      resultsSubFolders.push(
        options.slug || getDomainOrFileName(input),
        timestamp.format('YYYY-MM-DD-HH-mm-ss')
      );
    }
    storageBasePath = path.resolve('sitespeed-result', ...resultsSubFolders);
  }

  // backfill the slug
  options.slug = options.slug || getDomainOrFileName(input).replace(/\./g, '_');

  storagePathPrefix = path.join(...resultsSubFolders);

  if (resultBaseURL) {
    const url = urlParser.parse(resultBaseURL);
    resultsSubFolders.unshift(url.pathname.substr(1));
    url.pathname = resultsSubFolders.join('/');
    resultUrl = urlParser.format(url);
  }

  return {
    storageManager: storageManager(storageBasePath, storagePathPrefix, options),
    resultUrls: resultUrls(resultUrl, options.useHash)
  };
};
