import http from 'node:http';
import https from 'node:https';

import intel from 'intel';
import dayjs from 'dayjs';

import { getConnectivity, getURLAndGroup } from '../../support/tsdbUtil.js';
import {
  getAnnotationMessage,
  getTagsAsString
} from '../../support/annotationsHelper.js';

const log = intel.getLogger('sitespeedio.plugin.influxdb');

export function sendV2(
  url,
  group,
  absolutePagePath,
  screenShotsEnabledInBrowsertime,
  screenshotType,
  runTime,
  alias,
  usingBrowsertime,
  options
) {
  // The tags make it possible for the dashboard to use the
  // templates to choose which annotations that will be showed.
  // That's why we need to send tags that matches the template
  // variables in Grafana.
  const connectivity = getConnectivity(options);
  const browser = options.browser;
  const urlAndGroup = getURLAndGroup(
    options,
    group,
    url,
    options.influxdb.includeQueryParams,
    alias
  ).split('.');
  let tags = [
    `connectivity=${connectivity}`,
    `browser=${browser}`,
    `group=${urlAndGroup[0]}`,
    `page=${urlAndGroup[1]}`
  ];

  if (options.slug) {
    tags.push(`slug=${options.slug}`);
  }

  const message = getAnnotationMessage(
    absolutePagePath,
    screenShotsEnabledInBrowsertime,
    screenshotType,
    undefined,
    usingBrowsertime,
    options
  );
  const timestamp = runTime
    ? Math.round(dayjs(runTime) / 1000)
    : Math.round(dayjs() / 1000);
  // if we have a category, let us send that category too
  if (options.influxdb.tags) {
    for (const tag of options.influxdb.tags.split(',')) {
      tags.push(tag);
    }
  }
  const influxDBTags = tags.join(',');
  const grafanaTags = getTagsAsString(tags.map(pair => pair.split('=')[1]));
  const postData = `annotations,${influxDBTags} title="Sitespeed.io",text="${message}",tags=${grafanaTags} ${timestamp}`;
  const postOptions = {
    hostname: options.influxdb.host,
    port: options.influxdb.port,
    path: `/api/v2/write?org=${options.influxdb.organisation}&bucket=${options.influxdb.database}&precision=s`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      Authorization: `Token ${options.influxdb.token}`
    }
  };

  return new Promise((resolve, reject) => {
    log.debug('Send annotation to Influx: %j', postData);
    // not perfect but maybe work for us
    const library = options.influxdb.protocol === 'https' ? https : http;
    const request = library.request(postOptions, res => {
      if (res.statusCode === 204) {
        res.setEncoding('utf8');
        log.debug('Sent annotation to InfluxDB');
        resolve();
      } else {
        const e = new Error(
          `Got ${res.statusCode} from InfluxDB when sending annotation ${res.statusMessage}`
        );
        log.warn(e.message);
        reject(e);
      }
    });
    request.on('error', error => {
      log.error('Got error from InfluxDB when sending annotation', error);
      reject(error);
    });
    request.write(postData);
    request.end();
  });
}
