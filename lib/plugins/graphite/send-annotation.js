import http from 'node:http';
import https from 'node:https';
import { createRequire } from 'node:module';
import intel from 'intel';

import { getConnectivity, getURLAndGroup } from '../../support/tsdbUtil.js';
import {
  getTagsAsArray,
  getTagsAsString,
  getAnnotationMessage
} from '../../support/annotationsHelper.js';
import { toArray } from '../../support/util.js';

const require = createRequire(import.meta.url);
const version = require('../../../package.json').version;
const log = intel.getLogger('sitespeedio.plugin.graphite');

export function send(
  url,
  group,
  absolutePagePath,
  screenShotsEnabledInBrowsertime,
  screenshotType,
  time,
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
  const connectivity = getConnectivity(options);
  const browser = options.browser;
  const namespace = options.graphite.namespace.split('.');
  const urlAndGroup = getURLAndGroup(
    options,
    group,
    url,
    options.graphite.includeQueryParams,
    alias
  ).split('.');
  const tags = [
    connectivity,
    browser,
    namespace[0],
    namespace[1],
    urlAndGroup[0],
    urlAndGroup[1]
  ];
  // See https://github.com/sitespeedio/sitespeed.io/issues/3277
  if (options.slug && options.slug !== urlAndGroup[0]) {
    tags.push(options.slug);
  }
  const extraTags = toArray(options.graphite.annotationTag);
  // We got some extra tag(s) from the user, let us add them to the annotation
  if (extraTags.length > 0) {
    tags.push(...extraTags);
  }
  if (webPageTestExtraData) {
    tags.push(webPageTestExtraData.connectivity, webPageTestExtraData.location);
  }
  const theTags = options.graphite.arrayTags
    ? getTagsAsArray(tags)
    : getTagsAsString(tags);

  const message = getAnnotationMessage(
    absolutePagePath,
    screenShotsEnabledInBrowsertime,
    screenshotType,
    webPageTestExtraData
      ? webPageTestExtraData.webPageTestResultURL
      : undefined,
    usingBrowsertime,
    options
  );
  const roundDownTo = roundTo => x => Math.floor(x / roundTo) * roundTo;
  const roundDownToMinutes = roundDownTo(
    1000 * 60 * options.graphite.annotationRetentionMinutes
  );

  const timestamp = options.graphite.annotationRetentionMinutes
    ? Math.round(roundDownToMinutes(time.valueOf()) / 1000)
    : Math.round(time.valueOf() / 1000);

  let what =
    version +
    (browserNameAndVersion ? ` - ${browserNameAndVersion.version}` : '');
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
    const library = options.graphite.httpPort === 443 ? https : http;
    const request = library.request(postOptions, res => {
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
    request.on('error', error => {
      log.error('Got error from Graphite when sending annotation', error);
      reject(error);
    });
    request.write(postData);
    request.end();
  });
}
