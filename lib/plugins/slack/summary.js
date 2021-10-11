'use strict';
const util = require('util');
const get = require('lodash.get');
const h = require('../../support/helpers');
const tsdbUtil = require('../../support/tsdbUtil');

module.exports = function (dataCollector, errors, resultUrls, name, options) {
  const base = dataCollector.getSummary() || {};
  const metrics = {
    firstPaint: {
      name: 'First paint',
      metric: get(base.browsertime, 'summary.firstPaint.median'),
      f: h.time.ms
    },
    domContentLoadedTime: {
      name: 'domContentLoadedTime',
      metric: get(
        base.browsertime,
        'summary.pageTimings.domContentLoadedTime.median'
      ),
      f: h.time.ms
    },
    speedIndex: {
      name: 'Speed Index',
      metric: get(base.browsertime, 'summary.visualMetrics.SpeedIndex.median'),
      f: h.time.ms
    },
    firstVisualChange: {
      name: 'First Visual Change',
      metric: get(
        base.browsertime,
        'summary.visualMetrics.FirstVisualChange.median'
      ),
      f: h.time.ms
    },
    visualComplete85: {
      name: 'Visual Complete 85%',
      metric: get(
        base.browsertime,
        'summary.visualMetrics.VisualComplete85.median'
      ),
      f: h.time.ms
    },
    lastVisualChange: {
      name: 'Last Visual Change',
      metric: get(
        base.browsertime,
        'summary.visualMetrics.LastVisualChange.median'
      ),
      f: h.time.ms
    },
    fullyLoaded: {
      name: 'Fully Loaded',
      metric: get(base.pagexray, 'summary.fullyLoaded.median'),
      f: h.time.ms
    },
    coachScore: {
      name: 'Coach score',
      metric: get(base.coach, 'summary.performance.score.median'),
      f: h.noop
    },
    transferSize: {
      name: 'Page transfer weight',
      metric: get(base.pagexray, 'summary.transferSize.median'),
      f: h.size.format
    }
  };
  const iterations = get(options, 'browsertime.iterations', 0);
  const browser = h.cap(get(options, 'browsertime.browser', 'unknown'));
  const pages = h.plural(dataCollector.getURLs().length, 'page');
  const testName = h.short(name || '', 30) || 'Unknown';
  const device = options.mobile ? 'mobile' : 'desktop';
  const runs = h.plural(iterations, 'run');

  let summaryText =
    `${pages} analysed for ${testName} ` +
    `(${runs}, ${browser}/${device}/${tsdbUtil.getConnectivity(options)})\n`;

  let message = '';
  if (resultUrls.hasBaseUrl()) {
    message = ` (<${resultUrls.reportSummaryUrl()}/index.html |result>)`;
  }

  summaryText += '*Site summary*' + message + '\n';
  for (const key of Object.keys(metrics)) {
    if (metrics[key].metric !== undefined) {
      summaryText +=
        metrics[key].name + ': ' + metrics[key].f(metrics[key].metric) + '\n';
    }
  }

  let logo = 'https://www.sitespeed.io/img/slack/sitespeed-logo-slack.png';
  if (metrics.coachScore.median === 100) {
    logo = 'https://www.sitespeed.io/img/slack/sitespeed-logo-slack-100.png';
  }

  let errorText = '';
  if (errors.length > 0) {
    errorText += util.format('%d error(s):\n', errors.length);
    logo = 'https://www.sitespeed.io/img/slack/sitespeed-logo-slack-hm.png';
  }

  return {
    summaryText,
    errorText,
    logo
  };
};
