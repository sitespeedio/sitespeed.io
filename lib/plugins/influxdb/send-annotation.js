'use strict';
const http = require('http');
const https = require('https');
const log = require('intel').getLogger('sitespeedio.plugin.influxdb');
const querystring = require('querystring');
const tsdbUtil = require('../../support/tsdbUtil');
const annotationsHelper = require('../../support/annotationsHelper');
const dayjs = require('dayjs');

module.exports = {
  send(
    url,
    group,
    absolutePagePath,
    screenShotsEnabledInBrowsertime,
    screenshotType,
    runTime,
    alias,
    webPageTestExtraData,
    usingBrowsertime,
    options
  ) {
    // The tags make it possible for the dashboard to use the
    // templates to choose which annotations that will be showed.
    // That's why we need to send tags that matches the template
    // variables in Grafana.
    const connectivity = tsdbUtil.getConnectivity(options);
    const browser = options.browser;
    const urlAndGroup = tsdbUtil
      .getURLAndGroup(
        options,
        group,
        url,
        options.influxdb.includeQueryParams,
        alias
      )
      .split('.');
    let tags = [connectivity, browser, urlAndGroup[0], urlAndGroup[1]];

    // See https://github.com/sitespeedio/sitespeed.io/issues/3277
    if (options.slug && options.slug !== urlAndGroup[0]) {
      tags.push(options.slug);
    }

    if (webPageTestExtraData) {
      tags.push(webPageTestExtraData.connectivity);
      tags.push(webPageTestExtraData.location);
    }

    const message = annotationsHelper.getAnnotationMessage(
      absolutePagePath,
      screenShotsEnabledInBrowsertime,
      screenshotType,
      webPageTestExtraData
        ? webPageTestExtraData.webPageTestResultURL
        : undefined,
      usingBrowsertime,
      options
    );
    const timestamp = runTime
      ? Math.round(dayjs(runTime) / 1000)
      : Math.round(dayjs() / 1000);
    // if we have a category, let us send that category too
    if (options.influxdb.tags) {
      for (let row of options.influxdb.tags.split(',')) {
        const keyAndValue = row.split('=');
        tags.push(keyAndValue[1]);
      }
    }
    const influxDBTags = annotationsHelper.getTagsAsString(tags);
    const postData = `events title="Sitespeed.io",text="${message}",tags=${influxDBTags} ${timestamp}`;
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
      log.debug('Send annotation to Influx: %j', postData);
      // not perfect but maybe work for us
      const lib = options.influxdb.protocol === 'https' ? https : http;
      const req = lib.request(postOptions, res => {
        if (res.statusCode !== 204) {
          const e = new Error(
            `Got ${res.statusCode} from InfluxDB when sending annotation ${res.statusMessage}`
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
