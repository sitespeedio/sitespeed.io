'use strict';
const http = require('http');
const https = require('https');
const log = require('intel');
const Promise = require('bluebird');
const graphiteUtil = require('./util');

module.exports = {
  send(options, group, url, baseDir, pagePath, time) {

    // The tags make it possible for the dashboard to use the
    // templates to choose which annotations that will be showed.
    // That's why we need to send tags that matches the template
    // variables in Grafana.
    const connectivity = graphiteUtil.getConnectivity(options);
    const browser = options.browser;
    const namespace = options.graphite.namespace.split('.').join(',');
    const urlAndGroup = graphiteUtil.getURLAndGroup(options, group, url, options.graphite.includeQueryParams).split('.').join(',');
    const tags =  `${connectivity},${browser},${namespace},${urlAndGroup}`;
    const message = `<a href='${options.resultBaseURL}/${baseDir}/${pagePath}' target='_blank'>Result ${options.browsertime.iterations} run(s)</a>`;
    const timestamp = Math.round(time.valueOf() / 1000);
    const postData =
      `{"what": "Sitespeed.io", "tags": "${tags}", "data": "${message}", "when": ${timestamp}}`;
    const postOptions = {
      hostname: options.graphite.host,
      port: options.graphite.httpPort || 8080,
      path: '/events/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    // If Graphite is behind auth, use it!
    if (options.graphite.auth) {
      postOptions.auth = options.graphite.auth;
    }

    return new Promise((resolve, reject) => {
      log.trace('Send annotation to Graphite: %j', postData);
      // not perfect but maybe work for us
      const lib = options.graphite.httpPort === 443 ? https : http;
      const req = lib.request(postOptions, (res) => {
        if (res.statusCode !== 200) {
          log.error('Got %s from Graphite when sending annotation', res.statusCode);
          reject();
        } else {
        res.setEncoding('utf8');
        log.info('Sent annotation to Graphite');
        resolve();
      }
      });
      req.on('error', (err) => {
        log.error('Got error from Graphite when sending annotation', err);
        reject(err)
      });
      req.write(postData);
      req.end();
    })
  }
}
