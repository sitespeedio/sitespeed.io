import { parse, format } from 'node:url';
import path from 'node:path';

import { resultUrls } from './resultUrls.js';
import { storageManager } from './storageManager.js';

function getDomainOrFileName(input) {
  let domainOrFile = input;
  domainOrFile = domainOrFile.startsWith('http')
    ? parse(domainOrFile).hostname
    : path.basename(domainOrFile).replaceAll('.', '_');
  return domainOrFile;
}

export function resultsStorage(input, timestamp, options) {
  const outputFolder = options.outputFolder;
  const resultBaseURL = options.resultBaseURL;
  const resultsSubFolders = [];
  let storageBasePath;
  let storagePathPrefix;
  let resultUrl;

  if (outputFolder) {
    resultsSubFolders.push(path.basename(outputFolder));
    storageBasePath = path.resolve(outputFolder);
  } else {
    resultsSubFolders.push(
      options.slug || getDomainOrFileName(input),
      timestamp.format('YYYY-MM-DD-HH-mm-ss')
    );
    storageBasePath = path.resolve('sitespeed-result', ...resultsSubFolders);
  }

  storagePathPrefix = path.join(...resultsSubFolders);

  if (resultBaseURL) {
    const url = parse(resultBaseURL);
    resultsSubFolders.unshift(url.pathname.slice(1));
    url.pathname = resultsSubFolders.join('/');
    resultUrl = format(url);
  }

  return {
    storageManager: storageManager(storageBasePath, storagePathPrefix, options),
    resultUrls: resultUrls(resultUrl, options)
  };
}
