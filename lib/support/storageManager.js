'use strict';

const fs = require('fs-extra'),
  Promise = require('bluebird'),
  path = require('path'),
  crypto = require('crypto'),
  urlParser = require('url'),
  moment = require('moment'),
  isEmpty = require('./util').isEmpty;

Promise.promisifyAll(fs);
const mkdirp = Promise.promisify(require('mkdirp'));

const defaultDir = 'sitespeed-result';
let timestamp = moment().format().replace(/:/g, '');

function write(dirPath, filename, data) {
  return Promise.join(dirPath, filename, data,
    (dirPath, filename, data) =>
      fs.writeFileAsync(path.join(dirPath, filename), data, 'utf8'));
}

class StorageManager {
  constructor(options) {
    this.baseDir = path.resolve(process.cwd(), options.resultBaseDir || defaultDir, timestamp);
  }

  relativePathFromUrl(url) {
    const parsedUrl = urlParser.parse(url),
      pathSegments = parsedUrl.pathname.split('/');

    pathSegments.unshift(parsedUrl.hostname);

    if (!isEmpty(parsedUrl.search)) {
      const md5 = crypto.createHash('md5'),
        hash = md5.update(parsedUrl.search).digest('hex').substring(0, 8);
      pathSegments.push('query-' + hash);
    }

    return path.join.apply(null, pathSegments);
  }

  createDataDir() {
    return Promise.resolve(this.baseDir)
      .tap((baseDir) => mkdirp(baseDir));
  }

  writeData(filename, data) {
    return write(this.createDataDir(), filename, data);
  }

  copy(filename) {
    return Promise.join(this.createDataDir(), filename,
      (dirPath, filename) =>
          fs.copyAsync(filename, dirPath));
  }


  createDataDirForUrl(url) {
    return Promise.resolve(path.join(this.baseDir, this.relativePathFromUrl(url)))
      .tap((dirPath) => mkdirp(dirPath));
  }

  writeDataForUrl(url, filename, data) {
    return write(this.createDataDirForUrl(url), filename, data);
  }
}

module.exports = StorageManager;
