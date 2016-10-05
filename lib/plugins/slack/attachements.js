'use strict';

const h = require('../../support/helpers');

function getMetric(metric) {
  if (metric.median) {
    return metric.median + ' ms' + ' (' + metric.max + ')'
  } else {
    return metric;
  }
}

module.exports = {
  get(dataCollection) {

    const attachements = [];

    for (let url of Object.keys(dataCollection.urlPages)) {
      const base = dataCollection.urlPages[url].data;
      const metrics = {
        firstPaint: {
          name: 'First paint',
          metric: base.browsertime.pageSummary.statistics.timings.firstPaint
        },
        speedIndex: {
          name: 'Speed Index',
          metric: base.browsertime.pageSummary.statistics.visualMetrics ? base.browsertime.pageSummary.statistics.visualMetrics.SpeedIndex : undefined
        },
        domContentLoadedTime: {
          name: 'domContentLoadedTime',
          metric: base.browsertime.pageSummary.statistics.timings.pageTimings.domContentLoadedTime
        },
        rumSpeedIndex: {
          name: 'RUM Speed Index',
          metric: base.browsertime.pageSummary.statistics.timings.rumSpeedIndex
        },
        coachScore: {
          name: 'Coach score',
          metric: base.coach.pageSummary.advice.performance.score
        },
        transferSize: {
          name: 'Page transfer size',
          metric: h.size.format(base.pagexray.pageSummary.transferSize)
        },
        transferRequests: {
          name: 'Requests',
          metric: base.pagexray.pageSummary.requests
        }
      }

      const fields = [];
      for (const key of Object.keys(metrics)) {
        if (metrics[key].metric !== undefined) {
          fields.push({
            title: metrics[key].name,
            value: getMetric(metrics[key].metric),
            short: true
          })
        }
      }

      attachements.push({
        color: metrics.coachScore.metric > 90 ? 'good' : metrics.coachScore.metric > 80 ? 'warning' : 'danger',
        text: url,
        fields
      });
    }
    return attachements;
  }
}
