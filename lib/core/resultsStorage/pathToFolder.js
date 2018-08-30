'use strict';

const isEmpty = require('lodash.isempty'),
  crypto = require('crypto'),
  urlParser = require('url');

module.exports = function pathFromRootToPageDir(url, useHash) {
  const parsedUrl = urlParser.parse(decodeURIComponent(url)),
    pathSegments = parsedUrl.pathname.split('/').filter(Boolean);

  if (useHash && parsedUrl.hash) {
    pathSegments.unshift(parsedUrl.hash);
  }
  pathSegments.unshift(parsedUrl.hostname);

  pathSegments.unshift('pages');

  pathSegments.forEach(function(segment, index) {
    pathSegments[index] = segment.replace(/[^-a-z0-9_.]/gi, '-');
  });

  if (!isEmpty(parsedUrl.search)) {
    const md5 = crypto.createHash('md5'),
      hash = md5
        .update(parsedUrl.search)
        .digest('hex')
        .substring(0, 8);
    pathSegments.push('query-' + hash);
  }

  return pathSegments.join('/').concat('/');
};
