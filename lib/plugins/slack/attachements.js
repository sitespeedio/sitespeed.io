import get from 'lodash.get';
import { time, noop, size } from '../../support/helpers/index.js';

function getMetric(metric, f) {
  return metric.median
    ? f(metric.median) + ' (' + f(metric.max) + ')'
    : f(metric);
}

export function getAttachements(
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
        f: time.ms
      },
      speedIndex: {
        name: 'Speed Index',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.visualMetrics.SpeedIndex'
        ),
        f: time.ms
      },
      firstVisualChange: {
        name: 'First Visual Change',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.visualMetrics.FirstVisualChange'
        ),
        f: time.ms
      },
      visualComplete85: {
        name: 'Visual Complete 85%',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.visualMetrics.VisualComplete85'
        ),
        f: time.ms
      },
      lastVisualChange: {
        name: 'Last Visual Change',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.visualMetrics.LastVisualChange'
        ),
        f: time.ms
      },
      fullyLoaded: {
        name: 'Fully Loaded',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.timings.fullyLoaded'
        ),
        f: time.ms
      },
      domContentLoadedTime: {
        name: 'domContentLoadedTime',
        metric: get(
          base.browsertime,
          'pageSummary.statistics.timings.pageTimings.domContentLoadedTime'
        ),
        f: time.ms
      },
      coachScore: {
        name: 'Coach score',
        metric: get(base.coach, 'pageSummary.advice.performance.score'),
        f: noop
      },
      transferSize: {
        name: 'Page transfer size',
        metric: get(base.pagexray, 'pageSummary.transferSize'),
        f: size.format
      },
      transferRequests: {
        name: 'Requests',
        metric: get(base.pagexray, 'pageSummary.requests'),
        f: noop
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
}
