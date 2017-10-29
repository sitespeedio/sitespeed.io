'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  getURLs(urls) {
    const allUrls = [];
    urls = urls.map(url => url.trim());

    for (let url of urls) {
      if (url.startsWith('http')) {
        allUrls.push(url);
      } else {
        const filePath = path.resolve(url);
        try {
          const lines = fs
            .readFileSync(filePath)
            .toString()
            .split('\n');
          for (let line of lines) {
            if (line.trim().length > 0) {
              let lineArray = line.split(' ', 2);
              let url = lineArray[0].trim();
              if (url) {
                allUrls.push(url);
              }
            }
          }
        } catch (e) {
          if (e.code === 'ENOENT') {
            throw new Error(`Couldn't find url file at ${filePath}`);
          }
          throw e;
        }
      }
    }
    return allUrls;
  },
  getAliases(urls) {
    const urlMetaData = {};
    urls = urls.map(url => url.trim());

    for (let url of urls) {
      if (url.startsWith('http')) {
        return {};
      } else {
        const filePath = url;
        const lines = fs
          .readFileSync(filePath)
          .toString()
          .split('\n');
        for (let line of lines) {
          if (line.trim().length > 0) {
            let url,
              alias = null;
            let lineArray = line.split(' ', 2);
            url = lineArray[0].trim();
            if (lineArray[1]) {
              alias = lineArray[1].trim();
            }
            if (url && alias) {
              urlMetaData[url] = { alias: alias };
            }
          }
        }
      }
    }
    return urlMetaData;
  }
};
