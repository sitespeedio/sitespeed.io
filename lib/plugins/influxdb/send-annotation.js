'use strict';
const http = require('http');
const https = require('https');
const log = require('intel').getLogger('sitespeedio.plugin.influxdb');
const Promise = require('bluebird');
const querystring = require('querystring');
const tsdbUtil = require('../../support/tsdbUtil');

module.exports = {
  send(options, group, url, resultPageUrl, time) {
    // The tags make it possible for the dashboard to use the
    // templates to choose which annotations that will be showed.
    // That's why we need to send tags that matches the template
    // variables in Grafana.
    const connectivity = tsdbUtil.getConnectivity(options);
    const browser = options.browser;
    const urlAndGroup = tsdbUtil
      .getURLAndGroup(options, group, url, options.influxdb.includeQueryParams)
      .split('.');
    let tags = `${connectivity},${browser},${urlAndGroup.join(',')}`;
    const message = `<a href='${resultPageUrl}' target='_blank'>Result ${
      options.browsertime.iterations
    } run(s)</a>`;
    const timestamp = Math.round(time.valueOf() / 1000);
    // if we have a category, let us send that category too
    if (options.influxdb.tags) {
      for (var row of options.influxdb.tags.split(',')) {
        const keyAndValue = row.split('=');
        if (keyAndValue[0] === 'category') tags += `,${keyAndValue[1]}`;
      }
    }
    const postData = `events title="Sitespeed.io",text="${message}",tags="${tags}" ${timestamp}`;
    const postOptions = {
      hostname: options.influxdb.host,
      port: options.influxdb.port,
      path: '/write?db=' + options.influxdb.database + '&precision=s',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    if (options.influxdb.username) {
      postOptions.path =
        postOptions.path +
        '&' +
        querystring.stringify({
          u: options.influxdb.username,
          p: options.influxdb.password
        });
    }

    return new Promise((resolve, reject) => {
      log.verbose('Send annotation to Influx: %j', postData);
      // not perfect but maybe work for us
      const lib = options.influxdb.protocol === 'https' ? https : http;
      const req = lib.request(postOptions, res => {
        if (res.statusCode !== 204) {
          const e = new Error(
            `Got ${res.statusCode} from InfluxDB when sending annotation ${
              res.statusMessage
            }`
          );
          log.warn(e.message);
          reject(e);
        } else {
          res.setEncoding('utf-8');
          log.debug('Sent annotation to InfluxDB');
          resolve();
        }
      });
      req.on('error', err => {
        log.error('Got error from InfluxDB when sending annotation', err);
        reject(err);
      });
      req.write(postData);
      req.end();
    });
  }
};
