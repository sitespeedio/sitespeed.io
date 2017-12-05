'use strict';

const get = require('lodash.get');
const h = require('../../support/helpers');

function getMetric(metric) {
  if (metric.median) {
    return metric.median + ' ms' + ' (' + metric.max + ')';
  } else {
    return metric;
  }
}

module.exports = function(
  dataCollector,
  resultUrls,
  slackOptions,
  screenshotType
) {
  const attachments = [];

  for (let url of dataCollector.getURLs()) {
    const results = dataCollector.getURLData(url);
    const base = results.data;
    const metrics = {
      firstPaint: {
        name: 'First paint',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.timings.firstPaint'
        )
      },
      speedIndex: {
        name: 'Speed Index',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.visualMetrics.SpeedIndex'
        )
      },
      firstVisualChange: {
        name: 'First Visual Change',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.visualMetrics.FirstVisualChange'
        )
      },
      visualComplete85: {
        name: 'Visual Complete 85%',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.visualMetrics.VisualComplete85'
        )
      },
      lastVisualChange: {
        name: 'Last Visual Change',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.visualMetrics.LastVisualChange'
        )
      },
      fullyLoaded: {
        name: 'Fully Loaded',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.timings.fullyLoaded'
        )
      },
      domContentLoadedTime: {
        name: 'domContentLoadedTime',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.timings.pageTimings.domContentLoadedTime'
        )
      },
      rumSpeedIndex: {
        name: 'RUM Speed Index',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.timings.rumSpeedIndex'
        )
      },
      coachScore: {
        name: 'Coach score',
        metric: get(base.coach, 'pageSummary.advice.performance.score')
      },
      transferSize: {
        name: 'Page transfer size',
        metric: h.size.format(get(base.pagexray, 'pageSummary.transferSize'))
      },
      transferRequests: {
        name: 'Requests',
        metric: get(base.pagexray, 'pageSummary.requests')
      }
    };

    const fields = [];
    for (const key of Object.keys(metrics)) {
      const metric = metrics[key];
      if (metric.metric !== undefined) {
        fields.push({
          title: metric.name,
          value: getMetric(metric.metric),
          short: true
        });
      }
    }

    // add all the errors
    if (results.errors) {
      for (const key of Object.keys(results.errors)) {
        fields.push({
          title: key + ' error',
          value: results.errors[key],
          short: false
        });
      }
    }

    let color = 'good';

    const limitMetric = metrics[slackOptions.limitMetric];
    // if we failed with a run, we don't have the metric and just make it dangerous
    if (limitMetric === undefined) {
      color = 'danger';
    } else {
      if (slackOptions.limitMetric === 'coachScore') {
        if (limitMetric.metric < slackOptions.limitError) {
          color = 'danger';
        } else if (limitMetric.metric < slackOptions.limitWarning) {
          color = 'warning';
        }
      } else if (limitMetric.metric > slackOptions.limitError) {
        // SpeedIndex/firstVisualChange
        color = 'danger';
      } else if (limitMetric.metric > slackOptions.limitWarning) {
        color = 'warning';
      }
    }

    let text = url;

    if (resultUrls.hasBaseUrl()) {
      text += ` (<${resultUrls.absoluteSummaryPageUrl(url)}|result>)`;
    }
    const attachement = {
      color,
      text,
      fields
    };

    if (resultUrls.hasBaseUrl()) {
      attachement['image_url'] =
        resultUrls.absoluteSummaryPageUrl(url) +
        'data/screenshots/0.' +
        screenshotType;
    }

    attachments.push(attachement);
  }
  return attachments;
};
