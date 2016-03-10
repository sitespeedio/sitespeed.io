'use strict';

const fs = require('fs'),
  Promise = require('bluebird'),
  path = require('path'),
  urlParser = require('url'),
  moment = require('moment');

Promise.promisifyAll(fs);
const mkdirp = Promise.promisify(require('mkdirp'));

const defaultDir = 'sitespeed-result';
let timestamp = moment().format().replace(/:/g, '');

class StorageManager {
  constructor(options) {
    this.baseDir = path.resolve(process.cwd(), options.resultBaseDir || defaultDir, timestamp);
  }

  relativePathFromUrl(url) {
    let parsedUrl = urlParser.parse(url);

    let p = path.join.apply(null, parsedUrl.pathname.split('/'));

    return path.join(parsedUrl.hostname, p);
  }

  createDataDir() {
    return Promise.resolve(this.baseDir)
      .tap((baseDir) => mkdirp(baseDir));
  }

  writeData(filename, data) {
    return this._write(this.createDataDir(), filename, data);
  }

  createDataDirForUrl(url) {
    return Promise.resolve(path.join(this.baseDir, this.relativePathFromUrl(url)))
      .tap((dirPath) => mkdirp(dirPath));
  }

  writeDataForUrl(url, filename, data) {
    return this._write(this.createDataDirForUrl(url), filename, data);
  }

  _write(dirPath, filename, data) {
    return Promise.join(dirPath, filename, data,
      (dirPath, filename, data) =>
        fs.writeFileAsync(path.join(dirPath, filename), data, 'utf8'));
  }
}

module.exports = StorageManager;
