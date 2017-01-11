'use strict';

const fs = require('fs');

module.exports = {
  getURLs(urls, baseUrl, filePath) {
    const allUrls = [];
    baseUrl = baseUrl || '';
    urls = urls.map((url) => url.trim());
    
    if (filePath) {
      var lines = fs.readFileSync(filePath).toString().split('\n');
      for (let line of lines) {
        if (line.trim().length > 0) {
          let lineArray = line.split(" ", 2);
          let url = lineArray[0].trim();
          if(url) {
            allUrls.push(baseUrl + url);
          }
        }
      }
    } else {
      for (var url of urls) {
        allUrls.push(baseUrl + url);
      }
    }
    return allUrls;
  },
   getAliases(urls, filePath) {
    const urlMetaData = {};

    if (filePath) {
      var lines = fs.readFileSync(filePath).toString().split('\n');
      for (let line of lines) {
        if (line.trim().length > 0) {
          let url, alias = null;
          let lineArray = line.split(" ", 2);
          url = lineArray[0].trim();
          if(lineArray[1]) {
            alias = lineArray[1].trim();
          }
          if(url && alias) {
              urlMetaData[url] = {'alias' : alias};
          }
        }
      }
    } else {
      return {};
    }
    return urlMetaData;
  }
};
