import path from 'node:path';
import { promisify } from 'node:util';
import {
  rmdir as _rmdir,
  mkdir as _mkdir,
  lstat as _lstat,
  readdir as _readdir,
  unlink as _unlink,
  writeFile as _writeFile
} from 'node:fs';

import { copy } from 'fs-extra/esm';
import intel from 'intel';

import { pathToFolder } from './pathToFolder.js';

const log = intel.getLogger('sitespeedio.storageManager');
const mkdir = promisify(_mkdir);
const readdir = promisify(_readdir);
const lstat = promisify(_lstat);
const unlink = promisify(_unlink);
const rmdir = promisify(_rmdir);
const writeFile = promisify(_writeFile);

function write(dirPath, filename, data) {
  return writeFile(path.join(dirPath, filename), data);
}

function isValidDirectoryName(name) {
  return name !== undefined && name !== '';
}

export function storageManager(baseDir, storagePathPrefix, options) {
  return {
    rootPathFromUrl(url, alias) {
      return pathToFolder(url, options, alias)
        .split('/')
        .filter(element => isValidDirectoryName(element))
        .map(() => '..')
        .join('/')
        .concat('/');
    },
    createDirectory(...subDirectories) {
      const pathSegments = [baseDir, ...subDirectories].filter(element =>
        isValidDirectoryName(element)
      );

      const dirPath = path.join.apply(undefined, pathSegments);
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
      return this.createDirectory().then(dir => copy(filename, dir));
    },
    copyFileToDir(filename, dir) {
      return copy(filename, dir);
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
                await (stat.isDirectory() ? removeDir(p) : unlink(p));
              } catch (error) {
                log.error('Could not remove file:' + file, error);
              }
            })
          );
          await rmdir(dir);
        } catch (error) {
          log.error('Could not remove dir:' + dir, error);
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
}
