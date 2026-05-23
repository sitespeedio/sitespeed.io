import http from 'node:http';
import https from 'node:https';
import { createRequire } from 'node:module';
import { getLogger } from '@sitespeed.io/log';

import { getConnectivity, getURLAndGroup } from '../../support/tsdbUtil.js';
import {
  getTagsAsArray,
  getTagsAsString,
  getAnnotationMessage
} from '../../support/annotationsHelper.js';
import { toArray } from '../../support/util.js';

const require = createRequire(import.meta.url);
const version = require('../../../package.json').version;
const log = getLogger('sitespeedio.plugin.graphite');

const SEND_RETRIES = 3;

function postAnnotation(postOptions, postData, library) {
  return new Promise((resolve, reject) => {
    const request = library.request(postOptions, res => {
      if (res.statusCode === 200) {
        res.setEncoding('utf8');
        resolve();
      } else {
        const e = new Error(
          `Got ${res.statusCode} from Graphite when sending annotation`
        );
        e.statusCode = res.statusCode;
        reject(e);
      }
    });
    request.on('error', reject);
    request.write(postData);
    request.end();
  });
}

export async function send(
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

  if (options.slug) {
    tags.push(options.slug);
  }
  const extraTags = toArray(options.graphite.annotationTag);
  // We got some extra tag(s) from the user, let us add them to the annotation
  if (extraTags.length > 0) {
    tags.push(...extraTags);
  }
  const theTags = options.graphite.arrayTags
    ? getTagsAsArray(tags)
    : getTagsAsString(tags);

  const message = getAnnotationMessage(
    absolutePagePath,
    screenShotsEnabledInBrowsertime,
    screenshotType,
    undefined,
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
    path: options.graphite.proxyPath || '' + '/events/',
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

  log.verbose('Send annotation to Graphite: %j', postData);
  // not perfect but maybe work for us
  const library = options.graphite.httpPort === 443 ? https : http;

  for (let attempt = 1; ; attempt++) {
    try {
      await postAnnotation(postOptions, postData, library);
      log.debug('Sent annotation to Graphite');
      return;
    } catch (error) {
      const retryable =
        error.code !== undefined ||
        (error.statusCode >= 500 && error.statusCode < 600);
      if (!retryable || attempt > SEND_RETRIES) {
        if (error.statusCode === undefined) {
          log.error('Got error from Graphite when sending annotation', error);
        } else {
          log.warn(error.message);
        }
        throw error;
      }
      log.info(
        `Graphite annotation failed (attempt ${attempt}/${SEND_RETRIES}), retrying: ${error.message}`
      );
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
