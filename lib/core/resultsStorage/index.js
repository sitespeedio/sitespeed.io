import path from 'node:path';

import { resultUrls } from './resultUrls.js';
import { storageManager } from './storageManager.js';

function getDomainOrFileName(input) {
  if (input.startsWith('http')) {
    const url = new URL(input);
    return url.hostname;
  }

  return path.basename(input).replaceAll('.', '_');
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
    const url = new URL(resultBaseURL);
    // The S3 and GCS plugins upload to --s3.path/--gcs.path when it is set
    const uploadPath = options.s3?.path || options.gcs?.path;
    const urlFolders = uploadPath ? [uploadPath] : resultsSubFolders;

    const basePath = url.pathname.slice(1); // drop leading '/'
    if (basePath) {
      urlFolders.unshift(basePath);
    }

    const newPath = urlFolders.join('/');

    // Ensure leading slash for pathname
    url.pathname = newPath.startsWith('/') ? newPath : `/${newPath}`;

    resultUrl = url.toString();
  }

  return {
    storageManager: storageManager(storageBasePath, storagePathPrefix, options),
    resultUrls: resultUrls(resultUrl, options)
  };
}
