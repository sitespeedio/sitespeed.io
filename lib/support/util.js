'use strict';

const format = require('util').format,
path = require('path'),
url = require('url');

module.exports = {
  throwIfMissing(options, keys, namespace) {
    let missingKeys = keys.filter((key) => !options[key]);
    if (missingKeys.length > 0) {
      throw new Error(format('Required option(s) %s need to be specified in namespace "%s"',
        missingKeys.map((s) => '"' + s + '"'), namespace));
    }
  },
  isEmpty(o) {
    if (o === null || o === undefined)
      return true;

    if (typeof o === 'object')
      return Object.keys(o).length === 0;

    if (typeof o === 'string')
      return o.length === 0;

    return false;
  },
  isNotEmpty(o) {
    return !(module.exports.isEmpty(o));
  },
  getDomainOrFileName(string) {
    let domainOrFile = string;
    if (domainOrFile.startsWith('http')) {
      domainOrFile = url.parse(domainOrFile).hostname;
    } else {
      domainOrFile = path.basename(domainOrFile).replace(/\./g, '_');
    }
    return domainOrFile;
  },
  getShortUrl(url) {
    if (url.length > 40) {
        let shortUrl =  url.replace(/\?.*/,'');
        url = (shortUrl.substr(0, 20) + '...' + shortUrl.substr(-17));
    }
    return url
  }
};
