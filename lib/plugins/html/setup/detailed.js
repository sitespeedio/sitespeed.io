'use strict';

const h = require('../../../support/helpers');
const get = require('lodash.get');

function row(stat, name, metricName, formatter) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return {
    name,
    metricName,
    node: stat,
    h: formatter ? formatter : h.noop
  };
}

module.exports = function(data) {
  if (!data) {
    return [];
  }

  const rows = [];

  const coach = data.coach;
  const pagexray = data.pagexray;
  const browsertime = data.browsertime;
  const webpagetest = data.webpagetest;

  if (coach) {
    const summary = coach.summary;

    rows.push(
      row(summary.score, 'Coach score', 'overallScore'),
      row(
        summary.performance.score,
        'Coach performance score',
        'performanceScore'
      ),
      row(
        summary.accessibility.score,
        'Accessibility score',
        'accessibilityScore'
      ),
      row(
        summary.bestpractice.score,
        'Best Practice score',
        'bestPracticeScore'
      )
    );
  }

  if (pagexray) {
    const summary = pagexray.summary;
    const contentTypes = summary.contentTypes;

    rows.push(
      row(
        contentTypes.image.requests,
        'Image requests',
        'imageRequestsPerPage'
      ),
      row(contentTypes.css.requests, 'CSS requests', 'cssRequestsPerPage'),
      row(
        contentTypes.javascript.requests,
        'Javascript requests',
        'jsRequestsPerPage'
      ),
      row(contentTypes.font.requests, 'Font requests', 'fontRequestsPerPage'),
      row(summary.requests, 'Total requests', 'totalRequestsPerPage')
    );

    rows.push(
      row(
        contentTypes.image.transferSize,
        'Image size',
        'imageSizePerPage',
        h.size.format
      ),
      row(
        contentTypes.html.transferSize,
        'HTML size',
        'htmlSizePerPage',
        h.size.format
      ),
      row(
        contentTypes.css.transferSize,
        'CSS size',
        'cssSizePerPage',
        h.size.format
      ),
      row(
        contentTypes.javascript.transferSize,
        'Javascript size',
        'jsSizePerPage',
        h.size.format
      ),
      row(
        contentTypes.font.transferSize,
        'Font size',
        'fontSizePerPage',
        h.size.format
      ),
      row(summary.transferSize, 'Total size', 'totalSizePerPage', h.size.format)
    );

    const responseCodes = Object.keys(summary.responseCodes);
    for (let code of responseCodes) {
      rows.push(row(summary.responseCodes[code], code + ' responses'));
    }
  }

  if (browsertime) {
    const summary = browsertime.summary;

    rows.push(
      row(summary.rumSpeedIndex, 'RUMSpeed Index', 'rumSpeedIndex'),
      row(summary.firstPaint, 'First Paint', 'firstPaint'),
      row(summary.fullyLoaded, 'Fully loaded', 'fullyLoaded')
    );

    const timings = Object.keys(summary.pageTimings);
    for (let timing of timings) {
      rows.push(row(summary.pageTimings[timing], timing, timing));
    }

    if (summary.custom) {
      for (var key of Object.keys(summary.custom)) {
        rows.push(row(summary.custom[key], key));
      }
    }

    if (summary.visualMetrics) {
      rows.push(
        row(
          summary.visualMetrics.FirstVisualChange,
          'First Visual Change',
          'FirstVisualChange',
          h.time.ms
        ),
        row(summary.visualMetrics.SpeedIndex, 'Speed Index', 'SpeedIndex'),
        row(
          summary.visualMetrics.PerceptualSpeedIndex,
          'Perceptual Speed Index',
          'PerceptualSpeedIndex'
        ),
        row(
          summary.visualMetrics.VisualComplete85,
          'Visual Complete 85%',
          'VisualComplete85',
          h.time.ms
        ),
        row(
          summary.visualMetrics.VisualComplete95,
          'Visual Complete 95%',
          'VisualComplete95',
          h.time.ms
        ),
        row(
          summary.visualMetrics.VisualComplete99,
          'Visual Complete 99%',
          'VisualComplete99',
          h.time.ms
        ),
        row(
          summary.visualMetrics.LastVisualChange,
          'Last Visual Change',
          'LastVisualChange',
          h.time.ms
        )
      );
    }
  }

  if (webpagetest) {
    const firstView = get(webpagetest, 'summary.timing.firstView');
    if (firstView) {
      rows.push(
        row(firstView.render, 'WPT render (firstView)', 'render'),
        row(firstView.SpeedIndex, 'WPT SpeedIndex (firstView)', 'SpeedIndex'),
        row(
          firstView.fullyLoaded,
          'WPT Fully loaded (firstView)',
          'fullyLoaded'
        )
      );
    }
  }

  return rows.filter(Boolean);
};
