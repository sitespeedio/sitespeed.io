'use strict';

const fs = require('fs-extra');
const Promise = require('bluebird');
const path = require('path');

const pathToFolder = require('./pathToFolder');

const mkdirp = Promise.promisify(require('mkdirp'));

function write(dirPath, filename, data) {
  return fs.writeFile(path.join(dirPath, filename), data);
}

function isValidDirectoryName(name) {
  return name !== undefined && name !== '';
}

module.exports = function storageManager(baseDir, storagePathPrefix) {
  return {
    rootPathFromUrl(url) {
      return pathToFolder(url)
        .split('/')
        .filter(isValidDirectoryName)
        .map(() => '..')
        .join('/')
        .concat('/');
    },
    createDirectory(...subDirs) {
      const pathSegments = [baseDir, ...subDirs].filter(isValidDirectoryName);

      const dirPath = path.join.apply(null, pathSegments);
      return mkdirp(dirPath).then(() => dirPath);
    },
    writeData(data, filename) {
      return this.createDirectory('data').then(dir =>
        write(dir, filename, data)
      );
    },
    writeHtml(html, filename) {
      return this.createDirectory().then(dir => write(dir, filename, html));
    },
    getBaseDir() {
      return baseDir;
    },
    getStoragePrefix() {
      return storagePathPrefix;
    },
    copyToResultDir(filename) {
      return this.createDirectory().then(dir => fs.copy(filename, dir));
    },
    createDirForUrl(url, subDir) {
      return this.createDirectory(pathToFolder(url), subDir);
    },
    writeDataForUrl(data, filename, url, subDir) {
      return this.createDirectory(pathToFolder(url), 'data', subDir).then(dir =>
        write(dir, filename, data)
      );
    },
    writeHtmlForUrl(html, filename, url) {
      return this.createDirForUrl(url).then(dir => write(dir, filename, html));
    }
  };
};
