'use strict';

const fs = require('fs');

module.exports = {
  getURLs(urls) {
    const allUrls = [];
    urls = urls.map((url) => url.trim());

    for (var url of urls) {
      if (url.startsWith('http')) {
        allUrls.push(url);
      } else {
        const filePath = url;
        var lines = fs.readFileSync(filePath).toString().split('\n');
        for (let line of lines) {
          if (line.trim().length > 0) {
            allUrls.push(line.trim());
          }
        }
      }
    }
    return allUrls;
  }
};
