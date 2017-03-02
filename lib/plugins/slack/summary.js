'use strict';
const util = require('util'),
  h = require('../../support/helpers');

module.exports = {
  get(dataCollection, options, errors) {
    const base = dataCollection.summaryPages.index || {};
    const metrics = {
      firstPaint: {
        name: 'First paint',
        metric: base.browsertime ? base.browsertime.summary.firstPaint ? base.browsertime.summary.firstPaint.median : undefined : undefined
      },
      domContentLoadedTime: {
        name: 'domContentLoadedTime',
        metric: base.browsertime ? base.browsertime.summary.pageTimings.domContentLoadedTime.median : undefined
      },
      speedIndex: {
        name: 'Speed Index',
        metric: base.browsertime ? base.browsertime.summary.visualMetrics ? base.browsertime.summary.visualMetrics.SpeedIndex.median : undefined : undefined
      },
      firstVisualChange: {
        name: 'First Visual Change',
        metric: base.browsertime ? base.browsertime.summary.visualMetrics ? base.browsertime.summary.visualMetrics.FirstVisualChange.median : undefined : undefined
      },
      visualComplete85: {
        name: 'Visual Complete 85%',
        metric: base.browsertime ? base.browsertime.summary.visualMetrics ? base.browsertime.summary.visualMetrics.VisualComplete85.median : undefined : undefined
      },
      lastVisualChange: {
        name: 'Last Visual Change',
        metric: base.browsertime ? base.browsertime.summary.visualMetrics ? base.browsertime.summary.visualMetrics.LastVisualChange.median : undefined : undefined
      },
      fullyLoaded: {
        name: 'Fully Loaded',
        metric: base.browsertime ? base.browsertime.summary.fullyLoaded ? base.browsertime.summary.fullyLoaded.median : undefined : undefined
      },
      coachScore: {
        name: 'Coach score',
        metric: base.coach ? base.coach.summary.performance.score.median : undefined
      },
      transferSize: {
        name: 'Page transfer weight',
        metric: base.pagexray ? h.size.format(base.pagexray.summary.transferSize.median) : undefined
      }
    }

    let summaryText = `${h.plural(Object.keys(dataCollection.urlPages).length,'page')} analyzed for ${h.short(options.urls[0], 30)} ` +
      `(${h.plural(options.browsertime.iterations, 'run')}, ` +
      `${h.cap(options.browsertime.browser)}/${options.mobile ? 'mobile' : 'desktop'}/${options.connectivity})\n`;

    summaryText += '*Site summary*\n';
    for (var key of Object.keys(metrics)) {
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
      errorText += util.format('%d error(s):\n', errors.length);
      logo = 'https://www.sitespeed.io/img/slack/sitespeed-logo-slack-hm.png';
    }

    return {
      summaryText,
      errorText,
      logo
    };
  }
}
