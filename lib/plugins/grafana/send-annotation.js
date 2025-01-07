import http from 'node:http';
import https from 'node:https';
import { createRequire } from 'node:module';

import { getLogger } from '@sitespeed.io/log';

import { getConnectivity, getURLAndGroup } from '../../support/tsdbUtil.js';
import {
  getTagsAsArray,
  getAnnotationMessage
} from '../../support/annotationsHelper.js';
import { toArray } from '../../support/util.js';

const require = createRequire(import.meta.url);
const version = require('../../../package.json').version;
const log = getLogger('sitespeedio.plugin.grafana');

export function send(
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
  const connectivity = getConnectivity(options);
  const browser = options.browser;
  // Hmm, here we have hardcoded Graphite ...
  const namespace = options.graphite.namespace.split('.');
  const urlAndGroup = getURLAndGroup(
    options,
    group,
    url,
    tsdbType === 'graphite'
      ? options.graphite.includeQueryParams
      : options.influxdb.includeQueryParams,
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
  // Avoid having the same annotations twice https://github.com/sitespeedio/sitespeed.io/issues/3277#
  if (options.slug) {
    tags.push(options.slug);
  }
  const extraTags = toArray(options.grafana.annotationTag);
  // We got some extra tag(s) from the user, let us add them to the annotation
  if (extraTags.length > 0) {
    tags.push(...extraTags);
  }

  const tagsArray = getTagsAsArray(tags);

  const message = getAnnotationMessage(
    absolutePagePath,
    screenShotsEnabledInBrowsertime,
    screenshotType,
    undefined,
    usingBrowsertime,
    options
  );
  let what =
    version +
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
    postOptions.headers.Authorization =
      options.grafana.auth.startsWith('Bearer') ||
      options.grafana.auth.startsWith('Basic')
        ? options.grafana.auth
        : 'Bearer ' + options.grafana.auth;
  }
  log.verbose('Send annotation to Grafana: %j', postData);
  return new Promise((resolve, reject) => {
    // not perfect but maybe work for us
    const library = options.grafana.port === 443 ? https : http;
    const request = library.request(postOptions, res => {
      if (res.statusCode === 200) {
        res.setEncoding('utf8');
        log.debug('Sent annotation to Grafana');
        resolve();
      } else {
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
      }
    });
    request.on('error', error => {
      log.error('Got error from Grafana when sending annotation', error);
      reject(error);
    });
    request.write(postData);
    request.end();
  });
}
