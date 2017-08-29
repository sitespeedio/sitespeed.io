'use strict';

const isEmpty = require('lodash.isempty'),
  crypto = require('crypto'),
  urlParser = require('url');

module.exports = function pathFromRootToPageDir(url) {
  const parsedUrl = urlParser.parse(decodeURIComponent(url)),
    pathSegments = parsedUrl.pathname.split('/').filter(Boolean);

  pathSegments.unshift(parsedUrl.hostname);

  pathSegments.unshift('pages');

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
