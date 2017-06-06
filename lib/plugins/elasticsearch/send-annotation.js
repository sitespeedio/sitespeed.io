'use strict';
const http = require('http');
const https = require('https');
const log = require('intel').getLogger('sitespeedio.plugin.graphite');
const Promise = require('bluebird');
const elasticsearchUtil = require('../../support/tsdbUtil');

module.exports = {
  send(options, group, url, resultPageUrl, time) {

    // The tags make it possible for the dashboard to use the
    // templates to choose which annotations that will be showed.
    // That's why we need to send tags that matches the template
    // variables in Grafana.
    const connectivity = elasticsearchUtil.getConnectivity(options);
    const browser = options.browser;
    const namespace = options.elasticsearch.namespace.split('.');
    const urlAndGroup = elasticsearchUtil.getURLAndGroup(options, group, url, options.elasticsearch.includeQueryParams).split('.');
    const tagsString =  `"${connectivity},${browser},${namespace.join(',')},${urlAndGroup.join(',')}"`;
    const tagsArray = `["${connectivity}","${browser}","${namespace[0]}","${namespace[1]}","${urlAndGroup[0]}", "${urlAndGroup[1]}"]`;
    const message = `<a href='${resultPageUrl}' target='_blank'>Result ${options.browsertime.iterations} run(s)</a>`;
    const timestamp = Math.round(time.valueOf() / 1000);
    const tags = options.elasticsearch.arrayTags ? tagsArray : tagsString;
    const postData =
      `{"what": "Sitespeed.io", "tags": ${tags}, "data": "${message}", "when": ${timestamp}}`;
    const postOptions = {
      hostname: options.elasticsearch.webHost || options.elasticsearch.host,
      port: options.elasticsearch.httpPort || 8080,
      path: '/events/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    // If Elasticsearch is behind auth, use it!
    if (options.elasticsearch.auth) {
      postOptions.auth = options.elasticsearch.auth;
    }

    return new Promise((resolve, reject) => {
      log.verbose('Send annotation to Elasticsearch: %j', postData);
      // not perfect but maybe work for us
      const lib = options.elasticsearch.httpPort === 443 ? https : http;
      const req = lib.request(postOptions, (res) => {
        if (res.statusCode !== 200) {
          log.error('Got %s from Elasticsearch when sending annotation', res.statusCode);
          reject();
        } else {
          res.setEncoding('utf8');
          log.info('Sent annotation to Graphite');
          resolve();
        }
      });
      req.on('error', (err) => {
        log.error('Got error from Elasticsearch when sending annotation', err);
        reject(err)
      });
      req.write(postData);
      req.end();
    })
  }
};
