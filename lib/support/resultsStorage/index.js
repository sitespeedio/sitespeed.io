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
  let storagePathPrefix;
  let resultUrl = undefined;

  if (outputFolder) {
    resultsSubFolders.push(path.basename(outputFolder));
    storageBasePath = path.resolve(outputFolder);
  } else {
    resultsSubFolders.push(
      getDomainOrFileName(input),
      timestamp.format('YYYY-MM-DD-HH-mm-ss')
    );
    storageBasePath = path.resolve('sitespeed-result', ...resultsSubFolders);
  }

  storagePathPrefix = path.join(...resultsSubFolders);

  if (resultBaseURL) {
    const url = urlParser.parse(resultBaseURL);
    resultsSubFolders.unshift(url.pathname.substr(1));
    url.pathname = resultsSubFolders.join('/');
    resultUrl = urlParser.format(url);
  }

  return {
    storageManager: storageManager(storageBasePath, storagePathPrefix),
    resultUrls: resultUrls(resultUrl)
  };
};
