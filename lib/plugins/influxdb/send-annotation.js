'use strict';
const http = require('http');
const https = require('https');
const log = require('intel').getLogger('sitespeedio.plugin.influxdb');
const Promise = require('bluebird');
const graphiteUtil = require('../../support/tsdbUtil');

module.exports = {
  send(options, group, url, resultPageUrl, time) {
    // The tags make it possible for the dashboard to use the
    // templates to choose which annotations that will be showed.
    // That's why we need to send tags that matches the template
    // variables in Grafana.
    const connectivity = graphiteUtil.getConnectivity(options);
    const browser = options.browser;
    const namespace = options.graphite.namespace.split('.');
    const urlAndGroup = graphiteUtil.getURLAndGroup(options, group, url, options.graphite.includeQueryParams).split('.');
    const tags = `"${connectivity},${browser},${namespace.join(',')},${urlAndGroup.join(',')}"`;
    const message = `<a href='${resultPageUrl}' target='_blank'>Result ${options.browsertime.iterations} run(s)</a>`;
    const timestamp = Math.round(time.valueOf() / 1000);
    const postData =
      `events title="Sitespeed.io",text="${message}",tags=${tags} ${timestamp}`;
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
      postOptions.path = postOptions.path + '&u=' + options.influxdb.username + "&p=" + options.influxdb.password;
    }

    return new Promise((resolve, reject) => {
      log.verbose('Send annotation to Influx: %j', postData);
      // not perfect but maybe work for us
      const lib = options.influxdb.protocol === 'https' ? https : http;
      const req = lib.request(postOptions, (res) => {
        if (res.statusCode !== 204) {
          log.error('Got %s from InfluxDB when sending annotation %s', res.statusCode, res.statusMessage);
          reject();
        } else {
          res.setEncoding('utf-8');
          log.info('Sent annotation to InfluxDB');
          resolve();
        }
      });
      req.on('error', (err) => {
        log.error('Got error from InfluxDB when sending annotation', err);
        reject(err)
      });
      req.write(postData);
      req.end();
    })
  }
};
