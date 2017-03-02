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
  get(dataCollection, options) {

    const attachements = [];

    for (let url of Object.keys(dataCollection.urlPages)) {
      const base = dataCollection.urlPages[url].data;
      let metrics = {};
      metrics = {
        firstPaint: {
          name: 'First paint',
          metric: base.browsertime ? base.browsertime.pageSummary.statistics.timings.firstPaint : undefined
        },
        speedIndex: {
          name: 'Speed Index',
          metric: base.browsertime ? base.browsertime.pageSummary.statistics.visualMetrics ? base.browsertime.pageSummary.statistics.visualMetrics.SpeedIndex : undefined : undefined
        },
        firstVisualChange: {
          name: 'First Visual Change',
          metric: base.browsertime ? base.browsertime.pageSummary.statistics.visualMetrics ? base.browsertime.pageSummary.statistics.visualMetrics.FirstVisualChange : undefined : undefined
        },
        visualComplete85: {
          name: 'Visual Complete 85%',
          metric: base.browsertime ? base.browsertime.pageSummary.statistics.visualMetrics ? base.browsertime.pageSummary.statistics.visualMetrics.VisualComplete85 : undefined : undefined
        },
        lastVisualChange: {
          name: 'Last Visual Change',
          metric: base.browsertime ? base.browsertime.pageSummary.statistics.visualMetrics ? base.browsertime.pageSummary.statistics.visualMetrics.LastVisualChange : undefined : undefined
        },
        fullyLoaded: {
          name: 'Fully loaded',
          metric: base.browsertime ? base.browsertime.pageSummary.statistics.timings.fullyLoaded : undefined
        },
        domContentLoadedTime: {
          name: 'domContentLoadedTime',
          metric: base.browsertime ? base.browsertime.pageSummary.statistics.timings.pageTimings.domContentLoadedTime : undefined
        },
        rumSpeedIndex: {
          name: 'RUM Speed Index',
          metric: base.browsertime ? base.browsertime.pageSummary.statistics.timings.rumSpeedIndex : undefined
        },
        coachScore: {
          name: 'Coach score',
          metric: base.coach ? base.coach.pageSummary.advice.performance.score : undefined
        },
        transferSize: {
          name: 'Page transfer size',
          metric: base.pagexray ? h.size.format(base.pagexray.pageSummary.transferSize) : undefined
        },
        transferRequests: {
          name: 'Requests',
          metric: base.pagexray ? base.pagexray.pageSummary.requests : undefined
        }
      }

      const fields = [];
      for (const key of Object.keys(metrics)) {
        if (metrics[key] && metrics[key].metric !== undefined) {
          fields.push({
            title: metrics[key].name,
            value: getMetric(metrics[key].metric),
            short: true
          })
        }
      }

      // add all the errors
      if (dataCollection.urlPages[url].errors) {
        for (const key of Object.keys(dataCollection.urlPages[url].errors)) {
          fields.push({
            title: key + ' error',
            value: dataCollection.urlPages[url].errors[key],
            short: false
          })
        }
      }

      let color = metrics[options.limitMetric] ? metrics[options.limitMetric].metric > options.limitError ? 'good' : metrics[options.limitMetric].metric > options.limitWarning ? 'warning' : 'danger' : 'danger';

      attachements.push({
        color,
        text: url,
        fields
      });
    }
    return attachements;
  }
}
