'use strict';

const fs = require('fs-extra');
const path = require('path');
const log = require('intel').getLogger('sitespeedio.storageManager');
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const lstat = promisify(fs.lstat);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const pathToFolder = require('./pathToFolder');

function write(dirPath, filename, data) {
  return fs.writeFile(path.join(dirPath, filename), data);
}

function isValidDirectoryName(name) {
  return name !== undefined && name !== '';
}

module.exports = function storageManager(baseDir, storagePathPrefix, options) {
  return {
    rootPathFromUrl(url, alias) {
      return pathToFolder(url, options, alias)
        .split('/')
        .filter(isValidDirectoryName)
        .map(() => '..')
        .join('/')
        .concat('/');
    },
    createDirectory(...subDirs) {
      const pathSegments = [baseDir, ...subDirs].filter(isValidDirectoryName);

      const dirPath = path.join.apply(null, pathSegments);
      return mkdir(dirPath, { recursive: true }).then(() => dirPath);
    },
    writeData(data, filename) {
      return this.createDirectory('data').then(dir =>
        write(dir, filename, data)
      );
    },
    writeDataToDir(data, filename, dir) {
      return write(dir, filename, data);
    },
    writeHtml(html, filename) {
      return this.createDirectory().then(dir => write(dir, filename, html));
    },
    getBaseDir() {
      return baseDir;
    },
    getFullPathToURLDir(url, alias) {
      return path.join(baseDir, pathToFolder(url, options, alias));
    },
    getStoragePrefix() {
      return storagePathPrefix;
    },
    copyToResultDir(filename) {
      return this.createDirectory().then(dir => fs.copy(filename, dir));
    },
    copyFileToDir(filename, dir) {
      return fs.copy(filename, dir);
    },
    // TODO is missing alias
    removeDataForUrl(url) {
      const dirName = path.join(baseDir, pathToFolder(url, options));
      const removeDir = async dir => {
        try {
          const files = await readdir(dir);
          await Promise.all(
            files.map(async file => {
              try {
                const p = path.join(dir, file);
                const stat = await lstat(p);
                if (stat.isDirectory()) {
                  await removeDir(p);
                } else {
                  await unlink(p);
                }
              } catch (err) {
                log.error('Could not remove file:' + file, err);
              }
            })
          );
          await rmdir(dir);
        } catch (err) {
          log.error('Could not remove dir:' + dir, err);
        }
      };
      return removeDir(dirName);
    },
    createDirForUrl(url, subDir, alias) {
      return this.createDirectory(pathToFolder(url, options, alias), subDir);
    },
    writeDataForUrl(data, filename, url, subDir, alias) {
      return this.createDirectory(
        pathToFolder(url, options, alias),
        'data',
        subDir
      ).then(dir => write(dir, filename, data));
    },
    writeHtmlForUrl(html, filename, url, alias) {
      return this.createDirForUrl(url, undefined, alias).then(dir =>
        write(dir, filename, html)
      );
    }
  };
};
