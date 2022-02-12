'use strict';

module.exports = function (url, longVersion) {
  if (longVersion) {
    if (url.length > 100) {
      let shortUrl = url.replace(/\?.*/, '');
      url = shortUrl.substr(0, 80) + '...' + shortUrl.substr(-17);
    }
  } else {
    if (url.length > 40) {
      let shortUrl = url.replace(/\?.*/, '');
      url = shortUrl.substr(0, 20) + '...' + shortUrl.substr(-17);
    }
  }
  return url;
};
