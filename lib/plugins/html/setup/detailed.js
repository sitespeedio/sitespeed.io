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

// The group tag decides which card a metric lands in on detailed.html —
// tagging here (where the provenance of each metric is known) keeps the
// template free from name matching.
function addRows(rows, group, ...candidates) {
  for (const candidate of candidates) {
    if (candidate) {
      candidate.group = group;
      rows.push(candidate);
    }
  }
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

    addRows(
      rows,
      'coach',
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

    addRows(
      rows,
      'requests',
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

    addRows(
      rows,
      'pageWeight',
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
      addRows(
        rows,
        'responseCodes',
        row(summary.responseCodes[code], code + ' responses')
      );
    }
  }

  if (browsertime) {
    const summary = browsertime.summary;
    addRows(
      rows,
      'timings',
      row(summary.firstPaint, 'First Paint', 'firstPaint', time.ms)
    );

    if (summary.timings) {
      addRows(
        rows,
        'timings',
        row(summary.timings.fullyLoaded, 'Fully Loaded', 'fullyLoaded', time.ms)
      );
    }

    if (summary.timeToDomContentFlushed) {
      addRows(
        rows,
        'timings',
        row(
          summary.timeToDomContentFlushed,
          'DOMContentFlushed',
          'timeToDomContentFlushed',
          time.ms
        )
      );
    }

    if (summary.timings && summary.timings.largestContentfulPaint) {
      addRows(
        rows,
        'timings',
        row(
          summary.timings.largestContentfulPaint,
          'Largest Contentful Paint',
          'largestContentfulPaint',
          time.ms
        )
      );
    }

    if (summary.memory) {
      addRows(
        rows,
        'pageWeight',
        row(summary.memory, 'Memory usage', 'memory', size.format)
      );
    }

    if (summary.paintTiming) {
      const paintTimings = Object.keys(summary.paintTiming);
      const lookup = {
        'first-paint': 'First Paint',
        'first-contentful-paint': 'First Contentful Paint'
      };
      for (let pt of paintTimings) {
        addRows(
          rows,
          'timings',
          row(summary.paintTiming[pt], lookup[pt], pt, time.ms)
        );
      }
    }

    const timings = Object.keys(summary.pageTimings);
    for (let timing of timings) {
      addRows(
        rows,
        'timings',
        row(summary.pageTimings[timing], timing, timing, time.ms)
      );
    }

    if (summary.custom) {
      for (let key of Object.keys(summary.custom)) {
        addRows(rows, 'custom', row(summary.custom[key], key));
      }
    }

    if (summary.pageinfo && summary.pageinfo.cumulativeLayoutShift) {
      addRows(
        rows,
        'timings',
        row(
          summary.pageinfo.cumulativeLayoutShift,
          'Cumulative Layout Shift',
          'cumulativeLayoutShift'
        )
      );
    }

    if (summary.visualMetrics) {
      addRows(
        rows,
        'visual',
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
        addRows(
          rows,
          'visual',
          row(
            summary.visualMetrics.LargestImage,
            'Largest Image',
            'LargestImage',
            time.ms
          )
        );
      }
      if (summary.visualMetrics.Heading) {
        addRows(
          rows,
          'visual',
          row(summary.visualMetrics.Heading, 'Heading', 'Heading', time.ms)
        );
      }
      if (summary.visualMetrics.Logo) {
        addRows(
          rows,
          'visual',
          row(summary.visualMetrics.Logo, 'Logo', 'Logo', time.ms)
        );
      }
    }

    if (summary.cpu) {
      if (summary.cpu.longTasks) {
        addRows(
          rows,
          'cpu',
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
          )
        );
        // TBT and max potential FID are Web-Vitals-class metrics even
        // though browsertime derives them from the long-task data — they
        // belong next to LCP/CLS in the report, not in the CPU card.
        addRows(
          rows,
          'timings',
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
        addRows(
          rows,
          'cpu',
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
    addRows(
      rows,
      'axe',
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
    addRows(
      rows,
      'sustainable',
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
