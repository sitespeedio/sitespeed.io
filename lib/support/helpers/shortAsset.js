'use strict';

module.exports = function(url) {
  if (url.length > 40) {
    let shortUrl = url.replace(/\?.*/, '');
    url = shortUrl.substr(0, 20) + '...' + shortUrl.substr(-17);
  }
  return url;
};
