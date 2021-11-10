'use strict';

const isEmpty = require('lodash.isempty');
const crypto = require('crypto');
const log = require('intel').getLogger('sitespeedio.file');
const urlParser = require('url');

function toSafeKey(key) {
  // U+2013 : EN DASH – as used on https://en.wikipedia.org/wiki/2019–20_coronavirus_pandemic
  return key.replace(/[.~ /+|,:?&%–)(]|%7C/g, '-');
}

module.exports = function pathFromRootToPageDir(url, options, alias) {
  const useHash = options.useHash;
  const parsedUrl = urlParser.parse(decodeURIComponent(url));

  const pathSegments = [];
  const urlSegments = [];
  pathSegments.push('pages');
  pathSegments.push(parsedUrl.hostname.split('.').join('_'));

  if (options.urlMetaData && options.urlMetaData[url]) {
    pathSegments.push(options.urlMetaData[url]);
  } else if (alias) {
    pathSegments.push(alias);
  } else {
    if (!isEmpty(parsedUrl.pathname)) {
      urlSegments.push(...parsedUrl.pathname.split('/').filter(Boolean));
    }

    if (useHash && !isEmpty(parsedUrl.hash)) {
      const md5 = crypto.createHash('md5'),
        hash = md5.update(parsedUrl.hash).digest('hex').substring(0, 8);
      urlSegments.push('hash-' + hash);
    }

    if (!isEmpty(parsedUrl.search)) {
      const md5 = crypto.createHash('md5'),
        hash = md5.update(parsedUrl.search).digest('hex').substring(0, 8);
      urlSegments.push('query-' + hash);
    }

    // This is used from sitespeed.io to match URLs on Graphite
    if (!options.storeURLsAsFlatPageOnDisk) {
      pathSegments.push(...urlSegments);
    } else {
      const folder = toSafeKey(urlSegments.join('_').concat('_'));
      if (folder.length > 255) {
        log.info(
          `The URL ${url} hit the 255 character limit used when stored on disk, you may want to give your URL an alias to make sure it will not collide with other URLs.`
        );
        pathSegments.push(folder.substr(0, 254));
      } else {
        pathSegments.push(folder);
      }
    }
  }

  // pathSegments.push('data');

  pathSegments.forEach(function (segment, index) {
    if (segment) {
      pathSegments[index] = segment.replace(/[^-a-z0-9_.\u0621-\u064A]/gi, '-');
    }
  });

  return pathSegments.join('/').concat('/');
};
