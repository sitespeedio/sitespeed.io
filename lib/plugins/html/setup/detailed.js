import { noop, size, time } from '../../../support/helpers/index.js';

function row(stat, name, metricName, formatter) {
  if (stat === undefined) {
    return;
  }

  return {
    name,
    metricName,
    node: stat,
    h: formatter ?? noop
  };
}

export default function getDetailed(data) {
  if (!data) {
    return [];
  }
  const rows = [];

  const coach = data.coach;
  const pagexray = data.pagexray;
  const browsertime = data.browsertime;
  const axe = data.axe;
  const sustainable = data.sustainable;

  if (coach) {
    const summary = coach.summary;

    rows.push(
      row(summary.score, 'Coach score', 'overallScore'),
      row(
        summary.performance.score,
        'Coach performance score',
        'performanceScore'
      ),
      row(summary.privacy.score, 'Privacy score', 'privacyScore'),
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
      row(summary.requests, 'Total requests', 'totalRequestsPerPage'),
      row(
        contentTypes.image.transferSize,
        'Image size',
        'imageSizePerPage',
        size.format
      ),
      row(
        contentTypes.html.transferSize,
        'HTML size',
        'htmlSizePerPage',
        size.format
      ),
      row(
        contentTypes.css.transferSize,
        'CSS size',
        'cssSizePerPage',
        size.format
      ),
      row(
        contentTypes.javascript.transferSize,
        'Javascript size',
        'jsSizePerPage',
        size.format
      ),
      row(
        contentTypes.font.transferSize,
        'Font size',
        'fontSizePerPage',
        size.format
      ),
      row(summary.transferSize, 'Total size', 'totalSizePerPage', size.format)
    );

    const responseCodes = Object.keys(summary.responseCodes);
    for (let code of responseCodes) {
      rows.push(row(summary.responseCodes[code], code + ' responses'));
    }
  }

  if (browsertime) {
    const summary = browsertime.summary;
    rows.push(row(summary.firstPaint, 'First Paint', 'firstPaint', time.ms));

    if (summary.timings) {
      rows.push(
        row(summary.timings.fullyLoaded, 'Fully Loaded', 'fullyLoaded', time.ms)
      );
    }

    if (summary.timeToDomContentFlushed) {
      rows.push(
        row(
          summary.timeToDomContentFlushed,
          'DOMContentFlushed',
          'timeToDomContentFlushed',
          time.ms
        )
      );
    }

    if (summary.timings && summary.timings.largestContentfulPaint) {
      rows.push(
        row(
          summary.timings.largestContentfulPaint,
          'Largest Contentful Paint',
          'largestContentfulPaint',
          time.ms
        )
      );
    }

    if (summary.memory) {
      rows.push(row(summary.memory, 'Memory usage', 'memory', size.format));
    }

    if (summary.paintTiming) {
      const paintTimings = Object.keys(summary.paintTiming);
      const lookup = {
        'first-paint': 'First Paint',
        'first-contentful-paint': 'First Contentful Paint'
      };
      for (let pt of paintTimings) {
        rows.push(row(summary.paintTiming[pt], lookup[pt], pt, time.ms));
      }
    }

    const timings = Object.keys(summary.pageTimings);
    for (let timing of timings) {
      rows.push(row(summary.pageTimings[timing], timing, timing, time.ms));
    }

    if (summary.custom) {
      for (let key of Object.keys(summary.custom)) {
        rows.push(row(summary.custom[key], key));
      }
    }

    if (summary.pageinfo && summary.pageinfo.cumulativeLayoutShift) {
      rows.push(
        row(
          summary.pageinfo.cumulativeLayoutShift,
          'Cumulative Layout Shift',
          'cumulativeLayoutShift'
        )
      );
    }

    if (summary.visualMetrics) {
      rows.push(
        row(
          summary.visualMetrics.FirstVisualChange,
          'First Visual Change',
          'FirstVisualChange',
          time.ms
        ),
        row(
          summary.visualMetrics.SpeedIndex,
          'Speed Index',
          'SpeedIndex',
          time.ms
        ),
        row(
          summary.visualMetrics.PerceptualSpeedIndex,
          'Perceptual Speed Index',
          'PerceptualSpeedIndex',
          time.ms
        ),
        row(
          summary.visualMetrics.ContentfulSpeedIndex,
          'Contentful Speed Index',
          'ContentfulSpeedIndex',
          time.ms
        ),
        row(
          summary.visualMetrics.VisualComplete85,
          'Visual Complete 85%',
          'VisualComplete85',
          time.ms
        ),
        row(
          summary.visualMetrics.VisualComplete95,
          'Visual Complete 95%',
          'VisualComplete95',
          time.ms
        ),
        row(
          summary.visualMetrics.VisualComplete99,
          'Visual Complete 99%',
          'VisualComplete99',
          time.ms
        ),
        row(
          summary.visualMetrics.LastVisualChange,
          'Last Visual Change',
          'LastVisualChange',
          time.ms
        )
      );

      if (summary.visualMetrics.LargestImage) {
        rows.push(
          row(
            summary.visualMetrics.LargestImage,
            'Largest Image',
            'LargestImage',
            time.ms
          )
        );
      }
      if (summary.visualMetrics.Heading) {
        rows.push(
          row(summary.visualMetrics.Heading, 'Heading', 'Heading', time.ms)
        );
      }
      if (summary.visualMetrics.Logo) {
        rows.push(row(summary.visualMetrics.Logo, 'Logo', 'Logo', time.ms));
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
            time.ms
          ),
          row(
            summary.cpu.longTasks.totalBlockingTime,
            'Total Blocking Time',
            'totalBlockingTime',
            time.ms
          ),
          row(
            summary.cpu.longTasks.maxPotentialFid,
            'Max Potential First Input Delay',
            'maxPotentialFirstInputDelay',
            time.ms
          )
        );
      }

      if (summary.cpu.categories) {
        rows.push(
          row(
            summary.cpu.categories.parseHTML,
            'CPU Parse HTML',
            'parseHTMLPerPage',
            time.ms
          ),
          row(
            summary.cpu.categories.styleLayout,
            'CPU Style Layout',
            'styleLayoutPerPage',
            time.ms
          ),
          row(
            summary.cpu.categories.paintCompositeRender,
            'CPU Paint Composite Render',
            'paintCompositeRenderPerPage',
            time.ms
          ),
          row(
            summary.cpu.categories.scriptParseCompile,
            'CPU Script Parse Compile',
            'scriptParseCompilePerPage',
            time.ms
          ),
          row(
            summary.cpu.categories.scriptEvaluation,
            'CPU Script Evaluation',
            'scriptEvaluationPerPage',
            time.ms
          )
        );
      }
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

  if (sustainable) {
    rows.push(
      row(sustainable.summary.totalCO2, 'Total CO2', 'totalCO2'),
      row(
        sustainable.summary.co2PerPageView,
        'CO2 per page view',
        'co2PerPageView'
      ),
      row(
        sustainable.summary.co2FirstParty,
        'CO2 First Party',
        'co2FirstParty'
      ),
      row(sustainable.summary.co2ThirdParty, 'CO2 Third Party', 'co2ThirdParty')
    );
  }

  return rows.filter(Boolean);
}
