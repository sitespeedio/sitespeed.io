'use strict';

const fs = require('fs-extra'),
  Promise = require('bluebird'),
  isEmpty = require('lodash.isempty'),
  moment = require('moment'),
  path = require('path'),
  url = require('url'),
  zlib = require('zlib'),
  crypto = require('crypto'),
  urlParser = require('url');

Promise.promisifyAll(fs);
Promise.promisifyAll(zlib);

const mkdirp = Promise.promisify(require('mkdirp'));

function write(dirPath, filename, data, gzip) {
  return Promise.join(dirPath, filename, data,
    (dirPath, filename, data) => {
      if (gzip) {
        const buff = new Buffer(data, 'utf8');
        return zlib.gzipAsync(buff, {
          level: 1
        }).then((buffer) =>
          fs.writeFileAsync(path.join(dirPath, filename + '.gz'), buffer, 'utf8')
        );
      } else {
        return fs.writeFileAsync(path.join(dirPath, filename), data, 'utf8');
      }
    }
  );
}

function getDomainOrFileName(string) {
  let domainOrFile = string;
  if (domainOrFile.startsWith('http')) {
    domainOrFile = url.parse(domainOrFile).hostname;
  } else {
    domainOrFile = path.basename(domainOrFile).replace(/\./g, '_');
  }
  return domainOrFile;
}

class StorageManager {
  constructor(url, timestamp, options) {
    timestamp = timestamp || moment();
    options = options || {};

    const domainOrFile = getDomainOrFileName(url);

    this.timestamp = timestamp.format('YYYY-MM-DD-HH-mm-ss');
    this.relativeBaseDir = options.outputFolder ? options.outputFolder : path.join('sitespeed-result', domainOrFile, this.timestamp);
    this.baseDir =  path.resolve(process.cwd(), this.relativeBaseDir);

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
    const parsedUrl = urlParser.parse(decodeURIComponent(url)),
      pathSegments = parsedUrl.pathname.split('/').filter(Boolean);

    pathSegments.unshift(parsedUrl.hostname);

    pathSegments.unshift('pages');

    if (!isEmpty(parsedUrl.search)) {
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

  getRelativeBaseDir() {
    return this.relativeBaseDir;
  }

  copyToResultDir(filename) {
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

  writeDataForUrl(data, filename, url, subDir, gzip) {
    const dirPath = ['data', subDir].filter(Boolean).join(path.sep);
    return write(this.createDirForUrl(url, dirPath), filename, data, gzip);
  }

  writeHtmlForUrl(html, filename, url, gzip) {
    return write(this.createDirForUrl(url), filename, html, gzip);
  }
}

module.exports = StorageManager;
