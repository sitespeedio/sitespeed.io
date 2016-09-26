'use strict';

const fs = require('fs-extra'),
  Promise = require('bluebird'),
  moment = require('moment'),
  path = require('path'),
  crypto = require('crypto'),
  urlParser = require('url'),
  util = require('./util');

Promise.promisifyAll(fs);
const mkdirp = Promise.promisify(require('mkdirp'));

function write(dirPath, filename, data) {
  return Promise.join(dirPath, filename, data,
    (dirPath, filename, data) =>
      fs.writeFileAsync(path.join(dirPath, filename), data, 'utf8'));
}

class StorageManager {
  constructor(url, timestamp, options) {
    timestamp = timestamp || moment();
    options = options || {};

    const domainOrFile = util.getDomainOrFileName(url);

    this.timestamp = timestamp.format('YYYY-MM-DD-HH-mm-ss');
    this.baseDir = options.outputFolder ? path.resolve(process.cwd(), options.outputFolder) :
      path.resolve(process.cwd(), 'sitespeed-result', domainOrFile, this.timestamp);
  }

  rootPathFromUrl(url) {
    return this.pathFromRootToPageDir(url)
      .split('/')
      .filter(Boolean)
      .map(() => '..')
      .join('/')
      .concat('/');
  }

  pathFromRootToPageDir(url) {
    const parsedUrl = urlParser.parse(url),
      pathSegments = parsedUrl.pathname.split('/').filter(Boolean);

    pathSegments.unshift(parsedUrl.hostname);

    pathSegments.unshift('pages');

    if (util.isNotEmpty(parsedUrl.search)) {
      const md5 = crypto.createHash('md5'),
        hash = md5.update(parsedUrl.search).digest('hex').substring(0, 8);
      pathSegments.push('query-' + hash);
    }

    return pathSegments.join('/')
      .concat('/');
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
      this.pathFromRootToPageDir(url),
      subDir
    ].filter(Boolean);

    return Promise.resolve(path.join.apply(null, pathSegments))
      .tap((dirPath) => mkdirp(dirPath));
  }

  writeDataForUrl(data, filename, url, subDir) {
    const dirPath = ['data', subDir].filter(Boolean).join(path.delimiter);
    return write(this.createDirForUrl(url, dirPath), filename, data);
  }

  writeHtmlForUrl(html, filename, url) {
    return write(this.createDirForUrl(url), filename, html);
  }
}

module.exports = StorageManager;
