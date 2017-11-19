'use strict';
const util = require('util');
const get = require('lodash.get');
const h = require('../../support/helpers');

module.exports = function(dataCollector, errors, resultUrls, name, options) {
  const base = dataCollector.getSummary() || {};
  const metrics = {
    firstPaint: {
      name: 'First paint',
      metric: get(base.browsertime, 'summary.firstPaint.median')
    },
    domContentLoadedTime: {
      name: 'domContentLoadedTime',
      metric: get(
        base.browsertime,
        'summary.pageTimings.domContentLoadedTime.median'
      )
    },
    speedIndex: {
      name: 'Speed Index',
      metric: get(base.browsertime, 'summary.visualMetrics.SpeedIndex.median')
    },
    firstVisualChange: {
      name: 'First Visual Change',
      metric: get(
        base.browsertime,
        'summary.visualMetrics.FirstVisualChange.median'
      )
    },
    visualComplete85: {
      name: 'Visual Complete 85%',
      metric: get(
        base.browsertime,
        'summary.visualMetrics.VisualComplete85.median'
      )
    },
    lastVisualChange: {
      name: 'Last Visual Change',
      metric: get(
        base.browsertime,
        'summary.visualMetrics.LastVisualChange.median'
      )
    },
    fullyLoaded: {
      name: 'Fully Loaded',
      metric: get(base.browsertime, 'summary.fullyLoaded.median')
    },
    coachScore: {
      name: 'Coach score',
      metric: get(base.coach, 'summary.performance.score.median')
    },
    transferSize: {
      name: 'Page transfer weight',
      metric: h.size.format(get(base.pagexray, 'summary.transferSize.median'))
    }
  };

  let summaryText =
    `${h.plural(dataCollector.getURLs().length, 'page')} analyzed for ${h.short(
      name,
      30
    )} ` +
    `(${h.plural(options.browsertime.iterations, 'run')}, ` +
    `${h.cap(options.browsertime.browser)}/${
      options.mobile ? 'mobile' : 'desktop'
    }/${options.connectivity})\n`;

  let message = '';
  if (resultUrls.hasBaseUrl()) {
    message = ` (<${resultUrls.reportSummaryUrl()}|result>)`;
  }

  summaryText += '*Site summary*' + message + '\n';
  for (const key of Object.keys(metrics)) {
    if (metrics[key].metric !== undefined) {
      summaryText += metrics[key].name + ': ' + metrics[key].metric + '\n';
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
