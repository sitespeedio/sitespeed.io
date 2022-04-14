'use strict';
const http = require('http');
const https = require('https');
const log = require('intel').getLogger('sitespeedio.plugin.grafana');
const tsdbUtil = require('../../support/tsdbUtil');
const annotationsHelper = require('../../support/annotationsHelper');
const util = require('../../support/util');
const packageInfo = require('../../../package');

module.exports = {
  send(
    url,
    group,
    absolutePagePath,
    screenShotsEnabledInBrowsertime,
    screenshotType,
    time,
    tsdbType,
    alias,
    webPageTestExtraData,
    usingBrowsertime,
    browserNameAndVersion,
    options
  ) {
    // The tags make it possible for the dashboard to use the
    // templates to choose which annotations that will be showed.
    // That's why we need to send tags that matches the template
    // variables in Grafana.
    const connectivity = tsdbUtil.getConnectivity(options);
    const browser = options.browser;
    // Hmm, here we have hardcoded Graphite ...
    const namespace = options.graphite.namespace.split('.');
    const urlAndGroup = tsdbUtil
      .getURLAndGroup(
        options,
        group,
        url,
        tsdbType === 'graphite'
          ? options.graphite.includeQueryParams
          : options.influxdb.includeQueryParams,
        alias
      )
      .split('.');

    const tags = [
      connectivity,
      browser,
      namespace[0],
      namespace[1],
      urlAndGroup[0],
      urlAndGroup[1]
    ];
    // Avoid having the same annotations twice https://github.com/sitespeedio/sitespeed.io/issues/3277#
    if (options.slug && options.slug !== urlAndGroup[0]) {
      tags.push(options.slug);
    }
    const extraTags = util.toArray(options.grafana.annotationTag);
    // We got some extra tag(s) from the user, let us add them to the annotation
    if (extraTags.length > 0) {
      tags.push(...extraTags);
    }

    if (webPageTestExtraData) {
      tags.push(webPageTestExtraData.connectivity);
      tags.push(webPageTestExtraData.location);
    }

    const tagsArray = annotationsHelper.getTagsAsArray(tags);

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
    let what =
      packageInfo.version +
      (browserNameAndVersion ? ` - ${browserNameAndVersion.version}` : '');
    if (options.grafana.annotationTitle) {
      what = options.grafana.annotationTitle;
    }
    const timestamp = Math.round(time.valueOf() / 1000);
    const postData = `{"what": "${what}", "tags": ${tagsArray}, "data": "${message}", "when": ${timestamp}}`;
    const postOptions = {
      hostname: options.grafana.host,
      port: options.grafana.port,
      path: '/api/annotations/graphite',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    // If Grafana is behind auth, use it!
    if (options.grafana.auth) {
      log.debug('Using auth for Grafana');
      if (
        options.grafana.auth.startsWith('Bearer') ||
        options.grafana.auth.startsWith('Basic')
      ) {
        postOptions.headers.Authorization = options.grafana.auth;
      } else {
        postOptions.headers.Authorization = 'Bearer ' + options.grafana.auth;
      }
    }
    log.verbose('Send annotation to Grafana: %j', postData);
    return new Promise((resolve, reject) => {
      // not perfect but maybe work for us
      const lib = options.grafana.port === 443 ? https : http;
      const req = lib.request(postOptions, res => {
        if (res.statusCode !== 200) {
          const e = new Error(
            `Got ${res.statusCode} from Grafana when sending annotation`
          );
          if (res.statusCode === 403) {
            log.warn('Authentication required.', e.message);
          } else if (res.statusCode === 401) {
            log.warn('No valid authentication.', e.message);
          } else {
            log.warn(e.message);
          }
          reject(e);
        } else {
          res.setEncoding('utf8');
          log.debug('Sent annotation to Grafana');
          resolve();
        }
      });
      req.on('error', err => {
        log.error('Got error from Grafana when sending annotation', err);
        reject(err);
      });
      req.write(postData);
      req.end();
    });
  }
};
