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
  const axe = data.axe;

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
      row(summary.rumSpeedIndex, 'RUMSpeed Index', 'rumSpeedIndex', h.time.ms),
      row(summary.firstPaint, 'First Paint', 'firstPaint', h.time.ms),
      row(summary.fullyLoaded, 'Fully Loaded', 'fullyLoaded', h.time.ms)
    );

    if (summary.timeToDomContentFlushed) {
      rows.push(
        row(
          summary.timeToDomContentFlushed,
          'DOMContentFlushed',
          'timeToDomContentFlushed',
          h.time.ms
        )
      );
    }

    if (summary.paintTiming) {
      const paintTimings = Object.keys(summary.paintTiming);
      for (let pt of paintTimings) {
        rows.push(row(summary.paintTiming[pt], pt, pt, h.time.ms));
      }
    }

    const timings = Object.keys(summary.pageTimings);
    for (let timing of timings) {
      rows.push(row(summary.pageTimings[timing], timing, timing, h.time.ms));
    }

    if (summary.custom) {
      for (let key of Object.keys(summary.custom)) {
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
        row(
          summary.visualMetrics.SpeedIndex,
          'Speed Index',
          'SpeedIndex',
          h.time.ms
        ),
        row(
          summary.visualMetrics.PerceptualSpeedIndex,
          'Perceptual Speed Index',
          'PerceptualSpeedIndex',
          h.time.ms
        ),
        row(
          summary.visualMetrics.ContentfulSpeedIndex,
          'Contentful Speed Index',
          'ContentfulSpeedIndex',
          h.time.ms
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

      if (summary.visualMetrics.LargestImage) {
        rows.push(
          row(
            summary.visualMetrics.LargestImage,
            'Largest Image',
            'LargestImage',
            h.time.ms
          )
        );
      }
      if (summary.visualMetrics.Heading) {
        rows.push(
          row(summary.visualMetrics.Heading, 'Heading', 'Heading', h.time.ms)
        );
      }
      if (summary.visualMetrics.Logo) {
        rows.push(row(summary.visualMetrics.Logo, 'Logo', 'Logo', h.time.ms));
      }
    }

    if (summary.cpu) {
      if (summary.cpu.longTasks) {
        rows.push(
          row(
            summary.cpu.longTasks.tasks,
            'CPU Long Tasks',
            'cpuLongTasksPerPage'
          ),
          row(
            summary.cpu.longTasks.totalDuration,
            'CPU Long Tasks total duration',
            'cpuLongTasksTotalDurationPerPage',
            h.time.ms
          )
        );
      }

      if (summary.cpu.categories) {
        rows.push(
          row(
            summary.cpu.categories.parseHTML,
            'CPU Parse HTML',
            'parseHTMLPerPage',
            h.time.ms
          ),
          row(
            summary.cpu.categories.styleLayout,
            'CPU Style Layout',
            'styleLayoutPerPage',
            h.time.ms
          ),
          row(
            summary.cpu.categories.paintCompositeRender,
            'CPU Paint Composite Render',
            'paintCompositeRenderPerPage',
            h.time.ms
          ),
          row(
            summary.cpu.categories.scriptParseCompile,
            'CPU Script Parse Compile',
            'scriptParseCompilePerPage',
            h.time.ms
          ),
          row(
            summary.cpu.categories.scriptEvaluation,
            'CPU Script Evaluation',
            'scriptEvaluationPerPage',
            h.time.ms
          )
        );
      }
    }
  }

  if (webpagetest) {
    const firstView = get(webpagetest, 'summary.timing.firstView');
    if (firstView) {
      rows.push(
        row(firstView.render, 'WPT render (firstView)', 'render', h.time.ms),
        row(
          firstView.SpeedIndex,
          'WPT SpeedIndex (firstView)',
          'SpeedIndex',
          h.time.ms
        ),
        row(
          firstView.fullyLoaded,
          'WPT Fully loaded (firstView)',
          'fullyLoaded',
          h.time.ms
        )
      );
    }
  }

  if (axe) {
    rows.push(
      row(
        axe.summary.violations.critical,
        'Axe Critical Violations',
        'axeCriticalViolations'
      ),
      row(
        axe.summary.violations.serious,
        'Axe Serious Violations',
        'axeSeriousViolations'
      ),
      row(
        axe.summary.violations.minor,
        'Axe Minor Violations',
        'axemMinorViolations'
      ),
      row(
        axe.summary.violations.moderate,
        'Axe Moderate Violations',
        'axeModerateViolations'
      )
    );
  }

  return rows.filter(Boolean);
};
