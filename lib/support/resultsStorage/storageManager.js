'use strict';

const fs = require('fs-extra'),
  Promise = require('bluebird'),
  path = require('path'),
  zlib = require('zlib');

const pathToFolder = require('./pathToFolder');

Promise.promisifyAll(fs);
Promise.promisifyAll(zlib);

const mkdirp = Promise.promisify(require('mkdirp'));

function write(dirPath, filename, data, gzip) {
  return Promise.join(dirPath, filename, data, (dirPath, filename, data) => {
    if (gzip) {
      const buff = new Buffer(data, 'utf8');
      return zlib
        .gzipAsync(buff, {
          level: 1
        })
        .then(buffer =>
          fs.writeFileAsync(path.join(dirPath, filename + '.gz'), buffer)
        );
    } else {
      return fs.writeFileAsync(path.join(dirPath, filename), data, 'utf8');
    }
  });
}

module.exports = function storageManager(baseDir, storagePathPrefix) {
  return {
    rootPathFromUrl(url) {
      return pathToFolder(url)
        .split('/')
        .filter(Boolean)
        .map(() => '..')
        .join('/')
        .concat('/');
    },
    createDataDir(subDir) {
      const pathSegments = [baseDir, subDir].filter(Boolean);

      return Promise.resolve(path.join.apply(null, pathSegments)).tap(dirPath =>
        mkdirp(dirPath)
      );
    },
    writeData(filename, data) {
      return write(this.createDataDir('data'), filename, data);
    },
    writeHtml(filename, data) {
      return write(this.createDataDir(), filename, data);
    },
    getBaseDir() {
      return baseDir;
    },
    getStoragePrefix() {
      return storagePathPrefix;
    },
    copyToResultDir(filename) {
      return Promise.join(this.createDataDir(), filename, (dirPath, filename) =>
        fs.copyAsync(filename, dirPath)
      );
    },
    createDirForUrl(url, subDir) {
      const pathSegments = [baseDir, pathToFolder(url), subDir].filter(Boolean);

      return Promise.resolve(path.join.apply(null, pathSegments)).tap(dirPath =>
        mkdirp(dirPath)
      );
    },
    writeDataForUrl(data, filename, url, subDir, gzip) {
      const dirPath = ['data', subDir].filter(Boolean).join(path.sep);
      return write(this.createDirForUrl(url, dirPath), filename, data, gzip);
    },
    writeHtmlForUrl(html, filename, url, gzip) {
      return write(this.createDirForUrl(url), filename, html, gzip);
    }
  };
};
