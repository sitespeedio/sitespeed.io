'use strict';

const urlParser = require('url');
const path = require('path');
const resultUrls = require('./resultUrls');
const storageManager = require('./storageManager');

function getDomainOrFileName(input) {
  let domainOrFile = input;
  if (domainOrFile.startsWith('http')) {
    domainOrFile = urlParser.parse(domainOrFile).hostname;
  } else {
    domainOrFile = path.basename(domainOrFile).replace(/\./g, '_');
  }
  return domainOrFile;
}

module.exports = function(input, timestamp, outputFolder, resultBaseURL) {
  const resultsSubFolders = [];
  let storageBasePath;
  let storagePrefix;
  let resultUrl = undefined;

  if (outputFolder) {
    storageBasePath = path.resolve(outputFolder);
    storagePrefix = path.basename(storageBasePath);
  } else {
    timestamp = timestamp.format('YYYY-MM-DD-HH-mm-ss');
    resultsSubFolders.push(getDomainOrFileName(input), timestamp);
    storageBasePath = path.resolve('sitespeed-result', ...resultsSubFolders);
    storagePrefix = path.join(...resultsSubFolders);
  }

  if (resultBaseURL) {
    const url = urlParser.parse(resultBaseURL);
    resultsSubFolders.unshift(resultUrl.pathname);
    resultUrl.pathname = resultsSubFolders.join('/');
    resultUrl = urlParser.format(url);
  }

  return {
    storageManager: storageManager(storageBasePath, storagePrefix),
    resultUrls: resultUrls(resultUrl)
  };
};
