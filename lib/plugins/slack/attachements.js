'use strict';

const get = require('lodash.get');
const h = require('../../support/helpers');

function getMetric(metric, f) {
  if (metric.median) {
    return f(metric.median) + ' (' + f(metric.max) + ')';
  } else {
    return f(metric);
  }
}

module.exports = function (
  dataCollector,
  resultUrls,
  slackOptions,
  screenshotType,
  alias
) {
  const attachments = [];
  const urls =
    dataCollector && typeof dataCollector.getURLs === 'function'
      ? dataCollector.getURLs()
      : [];
  for (let url of urls) {
    const results = dataCollector.getURLData(url);
    const base = results.data;
    const metrics = {
      firstPaint: {
        name: 'First paint',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.timings.firstPaint'
        ),
        f: h.time.ms
      },
      speedIndex: {
        name: 'Speed Index',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.visualMetrics.SpeedIndex'
        ),
        f: h.time.ms
      },
      firstVisualChange: {
        name: 'First Visual Change',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.visualMetrics.FirstVisualChange'
        ),
        f: h.time.ms
      },
      visualComplete85: {
        name: 'Visual Complete 85%',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.visualMetrics.VisualComplete85'
        ),
        f: h.time.ms
      },
      lastVisualChange: {
        name: 'Last Visual Change',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.visualMetrics.LastVisualChange'
        ),
        f: h.time.ms
      },
      fullyLoaded: {
        name: 'Fully Loaded',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.timings.fullyLoaded'
        ),
        f: h.time.ms
      },
      domContentLoadedTime: {
        name: 'domContentLoadedTime',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.timings.pageTimings.domContentLoadedTime'
        ),
        f: h.time.ms
      },
      coachScore: {
        name: 'Coach score',
        metric: get(base.coach, 'pageSummary.advice.performance.score'),
        f: h.noop
      },
      transferSize: {
        name: 'Page transfer size',
        metric: get(base.pagexray, 'pageSummary.transferSize'),
        f: h.size.format
      },
      transferRequests: {
        name: 'Requests',
        metric: get(base.pagexray, 'pageSummary.requests'),
        f: h.noop
      }
    };

    const fields = [];
    for (const key of Object.keys(metrics)) {
      const metric = metrics[key];
      if (metric.metric !== undefined) {
        fields.push({
          title: metric.name,
          value: getMetric(metric.metric, metric.f),
          short: true
        });
      }
    }

    let color = 'good';

    // add all the errors
    if (results.errors) {
      color = 'danger';
      for (const key of Object.keys(results.errors)) {
        fields.push({
          title: key + ' error',
          value: results.errors[key],
          short: false
        });
      }
    }

    const limitMetric = metrics[slackOptions.limitMetric];
    // if we failed with a run, we don't have the metric and just make it dangerous
    if (limitMetric === undefined || (limitMetric && !limitMetric.metric)) {
      color = 'danger';
    } else {
      if (slackOptions.limitMetric === 'coachScore') {
        if (limitMetric.metric.median < slackOptions.limitError) {
          color = 'danger';
        } else if (limitMetric.metric.median < slackOptions.limitWarning) {
          color = 'warning';
        }
      } else if (limitMetric.metric.median > slackOptions.limitError) {
        // SpeedIndex/firstVisualChange
        color = 'danger';
      } else if (limitMetric.metric.median > slackOptions.limitWarning) {
        color = 'warning';
      }
    }

    let text = url;

    if (resultUrls.hasBaseUrl()) {
      text += ` (<${resultUrls.absoluteSummaryPagePath(
        url,
        alias[url]
      )}index.html |result>)`;
    }
    const attachement = {
      color,
      text,
      fields
    };

    if (resultUrls.hasBaseUrl()) {
      attachement['image_url'] =
        resultUrls.absoluteSummaryPagePath(url, alias[url]) +
        'data/screenshots/1/afterPageCompleteCheck.' +
        screenshotType;
    }

    attachments.push(attachement);
  }
  return attachments;
};
