import { parse, format } from 'node:url';
import { basename, resolve, join } from 'node:path';

import { resultUrls } from './resultUrls.js';
import { storageManager } from './storageManager.js';

function getDomainOrFileName(input) {
  let domainOrFile = input;
  domainOrFile = domainOrFile.startsWith('http')
    ? parse(domainOrFile).hostname
    : basename(domainOrFile).replace(/\./g, '_');
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
    resultsSubFolders.push(basename(outputFolder));
    storageBasePath = resolve(outputFolder);
  } else {
    resultsSubFolders.push(
      options.slug || getDomainOrFileName(input),
      timestamp.format('YYYY-MM-DD-HH-mm-ss')
    );
    storageBasePath = resolve('sitespeed-result', ...resultsSubFolders);
  }

  storagePathPrefix = join(...resultsSubFolders);

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
