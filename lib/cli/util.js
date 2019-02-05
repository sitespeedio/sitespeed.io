'use strict';

/*eslint no-console: 0*/

const fs = require('fs');
const path = require('path');
const toArray = require('../support/util').toArray;

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
                if (url.startsWith('http')) {
                  allUrls.push(url);
                } else if (url.startsWith('module.exports')) {
                  // This looks like someone is trying to run a script without adding the --multi parameter
                  // For now just write to the log and in the future we can maybe automatically fix it
                  console.error(
                    'Please use --multi if you want to run scripts. See https://www.sitespeed.io/documentation/sitespeed.io/scripting/#run'
                  );
                } else {
                  // We use skip adding it
                }
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
  getAliases(urls, alias) {
    const urlMetaData = {};
    urls = urls.map(url => url.trim());
    let al = toArray(alias);
    let pos = 0;

    for (let url of urls) {
      if (url.startsWith('http')) {
        if (al.length > 0 && al[pos]) {
          urlMetaData[url] = { alias: al[pos] };
        }
        pos += 1;
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
