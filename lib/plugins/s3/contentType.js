'use strict';

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';

const types = {
  css: 'text/css',
  gif: 'image/gif',
  html: 'text/html',
  ico: 'image/x-icon',
  jpeg: 'image/jpg',
  jpg: 'image/jpg',
  js: 'application/x-javascript',
  json: 'application/json',
  har: 'application/json',
  mp4: 'video/mp4',
  png: 'image/png',
  svg: 'image/svg+xml',
  gzip: 'application/gzip',
  log: 'text/plain'
};

module.exports = {
  getContentType(ext) {
    return types[ext] || DEFAULT_CONTENT_TYPE;
  }
};
