'use strict';

const fs = require('fs-extra'),
  Promise = require('bluebird'),
  path = require('path'),
  crypto = require('crypto'),
  urlParser = require('url'),
  moment = require('moment'),
  util = require('./util');

Promise.promisifyAll(fs);
const mkdirp = Promise.promisify(require('mkdirp'));

const defaultDir = 'sitespeed-result';
function write(dirPath, filename, data) {
  return Promise.join(dirPath, filename, data,
    (dirPath, filename, data) =>
      fs.writeFileAsync(path.join(dirPath, filename), data, 'utf8'));
}

class StorageManager {
  constructor(options, timestamp) {
    this.timestamp = timestamp.format('YYYY-MM-DD-HH-mm-ss');
    let domainOrFile = util.getDomainOrFileName(options._[0]);
    this.baseDir = path.resolve(process.cwd(), options.resultBaseDir || defaultDir, domainOrFile, this.timestamp);
  }

  rootPathFromUrl(url) {
    return this.relativePathFromUrl(url)
      .split('/')
      .filter(Boolean)
      .map(() => '..')
      .join('/');
  }

  relativePathFromUrl(url) {
    const parsedUrl = urlParser.parse(url),
      pathSegments = parsedUrl.pathname.split('/');

    pathSegments.unshift(parsedUrl.hostname);

    pathSegments.unshift('pages');

    if (util.isNotEmpty(parsedUrl.search)) {
      const md5 = crypto.createHash('md5'),
        hash = md5.update(parsedUrl.search).digest('hex').substring(0, 8);
      pathSegments.push('query-' + hash);
    }

    return path.join.apply(null, pathSegments);
  }

  createDataDir(subDir) {
    const pathSegments = [
      this.baseDir,
      subDir
    ].filter(Boolean);

    return Promise.resolve(path.join.apply(null, pathSegments))
      .tap((dirPath) => mkdirp(dirPath));
  }

  writeData(filename, data) {
    return write(this.createDataDir('data'), filename, data);
  }

  writeHtml(filename, data) {
    return write(this.createDataDir(), filename, data);
  }

  getBaseDir() {
    return this.baseDir;
  }

  copy(filename) {
    return Promise.join(this.createDataDir(), filename,
      (dirPath, filename) =>
        fs.copyAsync(filename, dirPath));
  }

  createDirForUrl(url, subDir) {
    const pathSegments = [
      this.baseDir,
      this.relativePathFromUrl(url),
      subDir
    ].filter(Boolean);

    return Promise.resolve(path.join.apply(null, pathSegments))
      .tap((dirPath) => mkdirp(dirPath));
  }

  createDataDirForUrl(url) {
    return this.createDirForUrl(url, 'data');
  }

  writeDataForUrl(url, filename, data) {
    return this.createDataDirForUrl(url)
      .then((dirPath) => write(dirPath, filename, data));
  }

  writeHtmlForUrl(url, filename, data) {
    return write(this.createDirForUrl(url), filename, data);
  }
}

module.exports = StorageManager;
