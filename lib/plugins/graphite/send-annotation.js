'use strict';
const http = require('http');
const https = require('https');
const log = require('intel').getLogger('sitespeedio.plugin.graphite');
const graphiteUtil = require('../../support/tsdbUtil');
const annotationsHelper = require('../../support/annotationsHelper');
const util = require('../../support/util');

module.exports = {
  send(
    url,
    group,
    absolutePagePath,
    screenShotsEnabledInBrowsertime,
    screenshotType,
    time,
    alias,
    webPageTestExtraData,
    usingBrowsertime,
    options
  ) {
    // The tags make it possible for the dashboard to use the
    // templates to choose which annotations that will be showed.
    // That's why we need to send tags that matches the template
    // variables in Grafana.
    const connectivity = graphiteUtil.getConnectivity(options);
    const browser = options.browser;
    const namespace = options.graphite.namespace.split('.');
    const urlAndGroup = graphiteUtil
      .getURLAndGroup(
        options,
        group,
        url,
        options.graphite.includeQueryParams,
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
    const extraTags = util.toArray(options.graphite.annotationTag);
    // We got some extra tag(s) from the user, let us add them to the annotation
    if (extraTags.length > 0) {
      tags.push(...extraTags);
    }
    if (webPageTestExtraData) {
      tags.push(webPageTestExtraData.connectivity);
      tags.push(webPageTestExtraData.location);
    }
    const theTags = options.graphite.arrayTags
      ? annotationsHelper.getTagsAsArray(tags)
      : annotationsHelper.getTagsAsString(tags);

    const s = options.browsertime.iterations > 1 ? 's' : '';
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
    const timestamp = Math.round(time.valueOf() / 1000);
    var what = `${options.browsertime.iterations} run${s}`;
    if (options.graphite.annotationTitle) {
      what = options.graphite.annotationTitle;
    }
    const postData = `{"what": "${what}", "tags": ${theTags}, "data": "${message}", "when": ${timestamp}}`;
    const postOptions = {
      hostname: options.graphite.webHost || options.graphite.host,
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
      log.debug('Using auth for Graphite');
      postOptions.auth = options.graphite.auth;
    }

    return new Promise((resolve, reject) => {
      log.verbose('Send annotation to Graphite: %j', postData);
      // not perfect but maybe work for us
      const lib = options.graphite.httpPort === 443 ? https : http;
      const req = lib.request(postOptions, res => {
        if (res.statusCode !== 200) {
          const e = new Error(
            `Got ${res.statusCode} from Graphite when sending annotation`
          );
          log.warn(e.message);
          reject(e);
        } else {
          res.setEncoding('utf8');
          log.debug('Sent annotation to Graphite');
          resolve();
        }
      });
      req.on('error', err => {
        log.error('Got error from Graphite when sending annotation', err);
        reject(err);
      });
      req.write(postData);
      req.end();
    });
  }
};
