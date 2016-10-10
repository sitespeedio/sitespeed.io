'use strict';
const util = require('util'),
  h = require('../../support/helpers');

module.exports = {
  get(dataCollection, options, errors) {
    const base = dataCollection.summaryPages.index;
    const metrics = {
      firstPaint: {
        name: 'First paint',
        metric: base.browsertime.summary.firstPaint ? base.browsertime.summary.firstPaint.median : undefined
      },
      domContentLoadedTime: {
        name: 'domContentLoadedTime',
        metric: base.browsertime.summary.pageTimings.domContentLoadedTime.median
      },
      speedIndex: {
        name: 'Speed Index',
        metric: base.browsertime.summary.visualMetrics ? base.browsertime.summary.visualMetrics.SpeedIndex.median : undefined
      },
      coachScore: {
        name: 'Coach score',
        metric: base.coach.summary.performance.score.median
      },
      transferSize: {
        name: 'Page transfer weight',
        metric: h.size.format(base.pagexray.summary.transferSize.median)
      }
    }

    let summaryText = 'Tested ' + `${h.plural(Object.keys(dataCollection.urlPages).length,'page')} analyzed for ${h.short(options.urls[0], 30)} ` +
      `(${h.plural(options.browsertime.iterations, 'run')}, ` +
      `${h.cap(options.browsertime.browser)}/${options.mobile ? 'mobile' : 'desktop'}/${options.connectivity})\n`;

    summaryText += '*Summary*\n';
    for (const key of Object.keys(metrics)) {
      if (metrics[key].metric !== undefined) {
        summaryText += metrics[key].name + ': ' + metrics[key].metric + '\n';
      }
    }

    let logo = 'https://www.sitespeed.io/img/slack/sitespeed-logo-slack.png';
    if (metrics.coachScore.median === 100) {
      logo = 'https://www.sitespeed.io/img/slack/sitespeed-logo-slack-100';
    }

    let errorText = '';
    if (errors.length > 0) {
      errorText += util.format(' (%d) errors', errors.length);
      logo = 'https://www.sitespeed.io/img/slack/sitespeed-logo-slack-hm.png';
    }

    return {
      summaryText,
      errorText,
      logo
    };
  }
}
