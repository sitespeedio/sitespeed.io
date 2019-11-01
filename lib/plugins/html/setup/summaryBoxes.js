'use strict';

const h = require('../../../support/helpers');
const capitalize = require('../../../support/helpers/cap');
const toArray = require('../../../support/util').toArray;

function infoBox(stat, name, formatter, url) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return _box(stat, name, 'info', formatter, url);
}

function scoreBox(stat, name, url) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return _box(stat, name, h.scoreLabel(stat.median), h.noop, url);
}

function metricBox(stat, name, score, formatter, url) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return _box(stat, name, h.scoreLabel(score.median), formatter, url);
}

function _box(stat, name, label, formatter, url) {
  const median = formatter ? formatter(stat.median) : stat.median;
  const p90 = formatter ? formatter(stat.p90) : stat.p90;

  return {
    name,
    label,
    median,
    p90,
    url
  };
}

module.exports = function(data, html) {
  if (!data) {
    return [];
  }

  const boxes = [];
  const axe = data.axe;

  const customMetrics = toArray(html.summaryBoxes);

  for (let key of customMetrics) {
    const metricKeys = key.split('.');
    const tool = metricKeys[0];
    if (data[tool]) {
      const toolSummary = data[tool].summary;
      const metric = metricKeys[1];
      const metricType = metricKeys[2];
      switch (tool) {
        case 'coach':
          switch (metric) {
            case 'score':
              boxes.push(
                scoreBox(toolSummary[metric], 'Overall score', 'overallScore')
              );
              break;
            case 'accessibility':
              boxes.push(
                scoreBox(
                  toolSummary[metric].score,
                  capitalize(metric) + ' score',
                  metric + 'Score'
                )
              );
              break;
            case 'performance':
              switch (metricType) {
                case 'score':
                  boxes.push(
                    scoreBox(
                      toolSummary[metric][metricType],
                      capitalize(metric) + ' ' + metricType,
                      metric + capitalize(metricType)
                    )
                  );
                  break;
                case 'fastRender':
                  boxes.push(
                    scoreBox(
                      toolSummary[metric][metricType],
                      'Fast Render advice',
                      'fastRender'
                    )
                  );
                  break;
                case 'avoidScalingImages':
                  boxes.push(
                    scoreBox(
                      toolSummary[metric][metricType],
                      'Avoid scaling images advice',
                      'avoidScalingImages'
                    )
                  );
                  break;
                case 'compressAssets':
                  boxes.push(
                    scoreBox(
                      toolSummary[metric][metricType],
                      'Compress assets advice',
                      'compressAssets'
                    )
                  );
                  break;
                case 'optimalCssSize':
                  boxes.push(
                    scoreBox(
                      toolSummary[metric][metricType],
                      'Optimal CSS size advice',
                      'optimalCssSize'
                    )
                  );
                  break;
                default:
                  break;
              }
              break;
            case 'bestpractice':
              boxes.push(
                scoreBox(
                  toolSummary[metric].score,
                  'Best Practice score',
                  'bestPracticeScore'
                )
              );
              break;
          }
          break;
        case 'browsertime':
          switch (metric) {
            case 'rumSpeedIndex':
              boxes.push(
                infoBox(
                  toolSummary[metric],
                  'RUM Speed Index',
                  h.noop,
                  'rumSpeedIndex'
                )
              );
              break;
            case 'firstPaint':
              boxes.push(
                infoBox(
                  toolSummary[metric],
                  'First Paint',
                  h.time.ms,
                  'firstPaint'
                )
              );
              break;
            case 'pageTimings':
              switch (metricType) {
                case 'backEndTime':
                  boxes.push(
                    infoBox(
                      toolSummary[metric][metricType],
                      'Backend Time',
                      h.time.ms,
                      metricType
                    )
                  );
                  break;
                case 'frontEndTime':
                  boxes.push(
                    infoBox(
                      toolSummary[metric][metricType],
                      'Frontend Time',
                      h.time.ms,
                      metricType
                    )
                  );
                  break;
                case 'pageLoadTime':
                  boxes.push(
                    infoBox(
                      toolSummary[metric][metricType],
                      'Page Load Time',
                      h.time.ms,
                      metricType
                    )
                  );
                  break;
              }
              break;
            case 'fullyLoaded':
              boxes.push(
                infoBox(
                  toolSummary[metric],
                  'Fully Loaded Time',
                  h.time.ms,
                  metric
                )
              );
              break;
            case 'visualMetrics':
              if (toolSummary[metric]) {
                switch (metricType) {
                  case 'FirstVisualChange':
                    boxes.push(
                      infoBox(
                        toolSummary[metric][metricType],
                        'First Visual Change',
                        h.time.ms
                      )
                    );
                    break;
                  case 'SpeedIndex':
                    boxes.push(
                      infoBox(
                        toolSummary[metric][metricType],
                        'Speed Index',
                        h.time.ms
                      )
                    );
                    break;
                  case 'PerceptualSpeedIndex':
                    boxes.push(
                      infoBox(
                        toolSummary[metric][metricType],
                        'Perceptual Speed Index',
                        h.time.ms
                      )
                    );
                    break;
                  case 'VisualComplete85':
                    boxes.push(
                      infoBox(
                        toolSummary[metric][metricType],
                        'Perceptual Speed Index',
                        h.time.ms
                      )
                    );
                    break;
                  case 'VisualComplete95':
                    boxes.push(
                      infoBox(
                        toolSummary[metric][metricType],
                        'Visual Complete 95%',
                        h.time.ms
                      )
                    );
                    break;
                  case 'VisualComplete99':
                    boxes.push(
                      infoBox(
                        toolSummary[metric][metricType],
                        'Visual Complete 99%',
                        h.time.ms
                      )
                    );
                    break;
                  case 'LastVisualChange':
                    boxes.push(
                      infoBox(
                        toolSummary[metric][metricType],
                        'Last Visual Change',
                        h.time.ms
                      )
                    );
                    break;
                  case 'LargestImage':
                    if (toolSummary[metric][metricType]) {
                      boxes.push(
                        infoBox(
                          toolSummary[metric][metricType],
                          'Last Image',
                          h.time.ms
                        )
                      );
                    }
                    break;
                  case 'Heading':
                  case 'Logo':
                    if (toolSummary[metric][metricType]) {
                      boxes.push(
                        infoBox(
                          toolSummary[metric][metricType],
                          metricType,
                          h.time.ms
                        )
                      );
                    }
                    break;
                }
              }
              break;
            case 'custom':
              if (toolSummary[metric]) {
                for (let key of Object.keys(toolSummary[metric])) {
                  boxes.push(infoBox(toolSummary[metric][key], key));
                }
              }
              break;
            case 'cpu':
              if (toolSummary[metric]) {
                switch (metricType) {
                  case 'tasks':
                    boxes.push(
                      infoBox(
                        toolSummary[metric].longTasks[metricType],
                        'CPU Long Tasks',
                        h.noop
                      )
                    );
                    break;
                  case 'totalDuration':
                    boxes.push(
                      infoBox(
                        toolSummary[metric].longTasks[metricType],
                        'CPU Long Tasks total duration',
                        h.time.ms
                      )
                    );
                    break;
                  default:
                    break;
                }
              }
              break;
            default:
              break;
          }
          break;
        case 'webpagetest':
          //extra switch condition for more than 'timing'
          //as prop for display
          switch (metric) {
            case 'firstView':
              if (toolSummary.timing[metric]) {
                const firstView = toolSummary.timing[metric];
                switch (metricType) {
                  case 'render':
                    boxes.push(
                      infoBox(firstView[metricType], `WPT render (${metric})`)
                    );
                    break;
                  case 'SpeedIndex':
                    boxes.push(
                      infoBox(
                        firstView[metricType],
                        `WPT SpeedIndex (${metric})`,
                        h.noop,
                        metricType
                      )
                    );
                    break;
                  case 'fullyLoaded':
                    boxes.push(
                      infoBox(
                        firstView[metricType],
                        `WPT Fully loaded (${metric})`
                      )
                    );
                    break;
                  default:
                    break;
                }
              }
              break;
          }
          break;
        case 'pagexray':
          switch (metric) {
            case 'transferSize':
              if (data[tool] && data['coach']) {
                const cSum = data['coach'].summary;
                switch (metricType) {
                  case 'image':
                    boxes.push(
                      metricBox(
                        toolSummary.contentTypes[metricType][metric],
                        'Image size (transfer)',
                        cSum.performance.imageSize,
                        h.size.format,
                        'imageSize'
                      )
                    );
                    break;
                  case 'javascript':
                    boxes.push(
                      metricBox(
                        toolSummary.contentTypes[metricType][metric],
                        'Javascript size (transfer)',
                        cSum.performance.javascriptSize,
                        h.size.format,
                        'javascriptSize'
                      )
                    );
                    break;
                  case 'css':
                    boxes.push(
                      metricBox(
                        toolSummary.contentTypes[metricType][metric],
                        'CSS size (transfer)',
                        cSum.performance.cssSize,
                        h.size.format,
                        'cssSize'
                      )
                    );
                    break;
                  default:
                    boxes.push(
                      metricBox(
                        toolSummary[metric],
                        'Total size (transfer)',
                        cSum.performance.pageSize,
                        h.size.format,
                        'pageSize'
                      )
                    );
                    break;
                }
              }
              break;
            case 'requests':
              switch (metricType) {
                case 'image':
                  boxes.push(
                    infoBox(
                      toolSummary.contentTypes[metricType][metric],
                      'Image requests'
                    )
                  );
                  break;
                case 'css':
                  boxes.push(
                    infoBox(
                      toolSummary.contentTypes[metricType][metric],
                      'CSS requests'
                    )
                  );
                  break;
                case 'javascript':
                  boxes.push(
                    infoBox(
                      toolSummary.contentTypes[metricType][metric],
                      'Javascript requests'
                    )
                  );
                  break;
                case 'font':
                  boxes.push(
                    infoBox(
                      toolSummary.contentTypes[metricType][metric],
                      'Font requests'
                    )
                  );
                  break;
                case 'total':
                  boxes.push(
                    infoBox(
                      toolSummary[metric],
                      capitalize(metricType) + ' ' + metric
                    )
                  );
                  break;
              }
              break;
            case 'domains':
              boxes.push(infoBox(toolSummary[metric], 'Domains per page'));
              break;
            case 'expireStats':
              boxes.push(
                infoBox(toolSummary[metric], 'Cache time', h.time.duration)
              );
              break;
            case 'lastModifiedStats':
              boxes.push(
                infoBox(
                  toolSummary[metric],
                  'Time since last modification',
                  h.time.duration
                )
              );
              break;
            case 'responseCodes':
              boxes.push(
                infoBox(
                  toolSummary[metric][metricType],
                  metricType + ' responses'
                )
              );
              break;
            case 'firstParty':
              if (toolSummary[metric]) {
                boxes.push(
                  infoBox(toolSummary[metric].requests, '1st party requests'),
                  infoBox(
                    toolSummary[metric].transferSize,
                    '1st party size',
                    h.size.format
                  )
                );
              }
              break;
            case 'thirdParty':
              if (toolSummary[metric]) {
                boxes.push(
                  infoBox(toolSummary[metric].requests, '3rd party requests'),
                  infoBox(
                    toolSummary[metric].transferSize,
                    '3rd party sizes',
                    h.size.format
                  )
                );
              }
              break;
            default:
              break;
          }
          break;
        default:
          break;
      }
    }
  }

  //could have better handling of axe, maybe

  if (axe) {
    const summary = axe.summary;
    if (axe) {
      boxes.push(
        _box(
          summary.violations.critical,
          'Axe Critical Violations',
          summary.violations.critical.median > 0 ? 'error' : 'ok',
          h.noop
        ),
        _box(
          summary.violations.serious,
          'Axe Serious Violations',
          summary.violations.serious.median > 0 ? 'error' : 'ok',
          h.noop
        ),
        _box(
          summary.violations.minor,
          'Axe Minor Violations',
          summary.violations.minor.median === 0
            ? 'ok'
            : summary.violations.minor.median > 5
              ? 'error'
              : 'warning',
          h.noop
        ),
        _box(
          summary.violations.moderate,
          'Axe Moderate Violations',
          summary.violations.moderate.median === 0
            ? 'ok'
            : summary.violations.moderate.median > 5
              ? 'error'
              : 'warning',
          h.noop
        )
      );
    }
  }

  return boxes;
};
