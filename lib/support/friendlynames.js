import {
  noop,
  size,
  time,
  co2,
  httpErrors,
  decimals
} from './helpers/index.js';

export default {
  browsertime: {
    googleWebVitals: {
      timeToFirstByte: {
        path: 'statistics.timings.pageTimings.backEndTime.median',
        summaryPath: 'pageTimings.backEndTime',
        runPath: 'timings.pageTimings.backEndTime',
        name: 'Time to First Byte',
        format: time.ms
      },
      firstContentfulPaint: {
        path: "statistics.timings.paintTiming['first-contentful-paint'].median",
        summaryPath: "timings.paintTiming['first-contentful-paint']",
        runPath: "timings.paintTiming['first-contentful-paint']",
        name: 'First Contentful Paint',
        format: time.ms
      },
      largestContentfulPaint: {
        path: 'statistics.timings.largestContentfulPaint.renderTime.median',
        summaryPath: 'timings.largestContentfulPaint',
        runPath: 'timings.largestContentfulPaint.renderTime',
        name: 'Largest Contentful Paint',
        format: time.ms
      },
      interactionToNextPaint: {
        path: 'statistics.timings.interactionToNextPaint.median',
        summaryPath: 'timings.interactionToNextPaint',
        runPath: 'timings.interactionToNextPaint',
        name: 'Interaction to Next Paint',
        format: time.ms
      },
      totalBlockingTime: {
        path: 'statistics.cpu.longTasks.totalBlockingTime.median',
        summaryPath: 'cpu.longTasks.totalBlockingTime',
        runPath: 'cpu.longTasks.totalBlockingTime',
        name: 'Total Blocking Time',
        format: time.ms
      },
      cumulativeLayoutShift: {
        path: 'statistics.pageinfo.cumulativeLayoutShift.median',
        runPath: 'googleWebVitals.cumulativeLayoutShift',
        summaryPath: 'pageinfo.cumulativeLayoutShift',
        name: 'Cumulative Layout Shift',
        format: decimals
      }
    },
    timings: {
      firstPaint: {
        path: 'statistics.timings.firstPaint.median',
        summaryPath: 'firstPaint',
        runPath: 'timings.firstPaint',
        name: 'First Paint',
        format: time.ms
      },
      firstContentfulPaint: {
        path: "statistics.timings.paintTiming['first-contentful-paint'].median",
        summaryPath: "paintTiming['first-contentful-paint']",
        runPath: "timings.paintTiming['first-contentful-paint']",
        name: 'First Contentful Paint',
        format: time.ms
      },
      largestContentfulPaint: {
        path: 'statistics.timings.largestContentfulPaint.renderTime.median',
        summaryPath: 'timings.largestContentfulPaint',
        runPath: 'timings.largestContentfulPaint.renderTime',
        name: 'Largest Contentful Paint',
        format: time.ms
      },
      loadEventEnd: {
        path: 'statistics.timings.loadEventEnd.median',
        summaryPath: 'loadEventEnd',
        runPath: 'timings.loadEventEnd',
        name: 'Load Event End',
        format: time.ms
      },
      fullyLoaded: {
        path: 'statistics.timings.fullyLoaded.median',
        summaryPath: 'timings.fullyLoaded',
        runPath: 'timings.fullyLoaded',
        name: 'Fully Loaded',
        format: time.ms
      },
      serverResponseTime: {
        path: 'statistics.timings.pageTimings.serverResponseTime.median',
        summaryPath: 'pageTimings.serverResponseTime',
        runPath: 'timings.pageTimings.serverResponseTime',
        name: 'Server Response Time',
        format: time.ms
      },
      backEndTime: {
        path: 'statistics.timings.pageTimings.backEndTime.median',
        summaryPath: 'pageTimings.backEndTime',
        runPath: 'timings.pageTimings.backEndTime',
        name: 'TTFB',
        format: time.ms
      },
      pageLoadTime: {
        path: 'statistics.timings.pageTimings.pageLoadTime.median',
        summaryPath: 'pageTimings.pageLoadTime',
        runPath: 'timings.pageTimings.pageLoadTime',
        name: 'Page Load Time',
        format: time.ms
      },
      FirstVisualChange: {
        path: 'statistics.visualMetrics.FirstVisualChange.median',
        summaryPath: 'visualMetrics.FirstVisualChange',
        runPath: 'visualMetrics.FirstVisualChange',
        name: 'First Visual Change',
        format: time.ms
      },
      LastVisualChange: {
        path: 'statistics.visualMetrics.LastVisualChange.median',
        summaryPath: 'visualMetrics.LastVisualChange',
        runPath: 'visualMetrics.LastVisualChange',
        name: 'Last Visual Change',
        format: time.ms
      },
      SpeedIndex: {
        path: 'statistics.visualMetrics.SpeedIndex.median',
        summaryPath: 'visualMetrics.SpeedIndex',
        runPath: 'visualMetrics.SpeedIndex',
        name: 'Speed Index',
        format: time.ms
      },
      ContentfulSpeedIndex: {
        path: 'statistics.visualMetrics.ContentfulSpeedIndex.median',
        summaryPath: 'visualMetrics.ContentfulSpeedIndex',
        runPath: 'visualMetrics.ContentfulSpeedIndex',
        name: 'Contentful Speed Index',
        format: time.ms
      },
      PerceptualSpeedIndex: {
        path: 'statistics.visualMetrics.PerceptualSpeedIndex.median',
        summaryPath: 'visualMetrics.PerceptualSpeedIndex',
        runPath: 'visualMetrics.PerceptualSpeedIndex',
        name: 'Perceptual Speed Index',
        format: time.ms
      },
      VisualReadiness: {
        path: 'statistics.visualMetrics.VisualReadiness.median',
        summaryPath: 'visualMetrics.VisualReadiness',
        runPath: 'visualMetrics.VisualReadiness',
        name: 'Visual Readiness',
        format: time.ms
      },
      VisualComplete95: {
        path: 'statistics.visualMetrics.VisualComplete95.median',
        summaryPath: 'visualMetrics.VisualComplete95',
        runPath: 'visualMetrics.VisualComplete95',
        name: 'Visual Complete 95',
        format: time.ms
      },
      VisualComplete99: {
        path: 'statistics.visualMetrics.VisualComplete99.median',
        summaryPath: 'visualMetrics.VisualComplete99',
        runPath: 'visualMetrics.VisualComplete99',
        name: 'Visual Complete 99',
        format: time.ms
      },
      VisualComplete: {
        path: 'statistics.visualMetrics.VisualComplete.median',
        summaryPath: 'visualMetrics.VisualComplete',
        runPath: 'visualMetrics.VisualComplete',
        name: 'Visual Complete',
        format: time.ms
      }
    },
    cpu: {
      totalBlockingTime: {
        path: 'statistics.cpu.longTasks.totalBlockingTime.median',
        summaryPath: 'cpu.longTasks.totalBlockingTime',
        runPath: 'cpu.longTasks.totalBlockingTime',
        name: 'Total Blocking Time',
        format: time.ms
      },
      maxPotentialFid: {
        path: 'statistics.cpu.longTasks.maxPotentialFid.median',
        summaryPath: 'cpu.longTasks.maxPotentialFid',
        runPath: 'cpu.longTasks.maxPotentialFid',
        name: 'Max Potential FID',
        format: time.ms
      },
      longTasks: {
        path: 'statistics.cpu.longTasks.tasks.median',
        summaryPath: 'cpu.longTasks.tasks',
        runPath: 'cpu.longTasks.tasks',
        name: 'Number of Long Tasks',
        format: noop
      },
      longTasksTotalDuration: {
        path: 'statistics.cpu.longTasks.totalDuration.median',
        summaryPath: 'cpu.longTasks.totalDuration',
        runPath: 'cpu.longTasks.totalDuration',
        name: 'Total Duration of Long Tasks',
        format: time.ms
      }
    },
    browser: {
      cpuBenchmark: {
        path: 'statistics.browser.cpuBenchmark.median',
        summaryPath: 'browser.cpuBenchmark',
        runPath: 'browser.cpuBenchmark',
        name: 'CPU benchmark score',
        format: time.ms
      }
    },
    pageinfo: {
      cumulativeLayoutShift: {
        path: 'statistics.pageinfo.cumulativeLayoutShift.median',
        summaryPath: 'pageinfo.cumulativeLayoutShift',
        runPath: 'pageinfo.cumulativeLayoutShift',
        name: 'Cumulative Layout Shift',
        format: decimals
      },
      domElements: {
        path: 'statistics.pageinfo.domElements.median',
        summaryPath: 'pageinfo.domElements',
        runPath: 'pageinfo.domElements',
        name: 'DOM elements',
        format: noop
      },
      documentHeight: {
        path: 'statistics.pageinfo.documentHeight.median',
        summaryPath: 'pageinfo.documentHeight',
        runPath: 'pageinfo.documentHeight',
        name: 'Document height',
        format: noop
      }
    }
  },
  pagexray: {
    requests: {
      total: {
        path: 'statistics.requests.median',
        summaryPath: 'requests',
        runPath: 'requests',
        name: 'Total Requests',
        format: noop
      },
      html: {
        path: 'statistics.contentTypes.html.requests.median',
        summaryPath: 'contentTypes.html.requests',
        runPath: 'contentTypes.html.requests',
        name: 'HTML Requests',
        format: noop
      },
      javascript: {
        path: 'statistics.contentTypes.javascript.requests.median',
        summaryPath: 'contentTypes.javascript.requests',
        runPath: 'contentTypes.javascript.requests',
        name: 'JavaScript Requests',
        format: noop
      },
      css: {
        path: 'statistics.contentTypes.css.requests.median',
        summaryPath: 'contentTypes.css.requests',
        runPath: 'contentTypes.css.requests',
        name: 'CSS Requests',
        format: noop
      },
      image: {
        path: 'statistics.contentTypes.images.requests.median',
        summaryPath: 'contentTypes.images.requests',
        runPath: 'contentTypes.images.requests',
        name: 'Image Requests',
        format: noop
      },
      font: {
        path: 'statistics.contentTypes.font.requests.median',
        summaryPath: 'contentTypes.font.requests',
        runPath: 'contentTypes.font.requests',
        name: 'Font Requests',
        format: noop
      },
      httpErrors: {
        path: 'statistics.responseCodes.median',
        summaryPath: 'responseCodes',
        runPath: 'responseCodes',
        name: 'HTTP Errors',
        format: httpErrors
      }
    },
    transferSize: {
      total: {
        path: 'statistics.transferSize.median',
        summaryPath: 'transferSize',
        runPath: 'transferSize',
        name: 'Total Transfer Size',
        format: size.format
      },
      html: {
        path: 'statistics.contentTypes.html.transferSize.median',
        summaryPath: 'contentTypes.html.transferSize',
        runPath: 'contentTypes.html.transferSize',
        name: 'HTML Transfer Size',
        format: size.format
      },
      javascript: {
        path: 'statistics.contentTypes.javascript.transferSize.median',
        summaryPath: 'contentTypes.javascript.transferSize',
        runPath: 'contentTypes.javascript.transferSize',
        name: 'JavaScript Transfer Size',
        format: size.format
      },
      css: {
        path: 'statistics.contentTypes.css.transferSize.median',
        summaryPath: 'contentTypes.css.transferSize',
        runPath: 'contentTypes.css.transferSize',
        name: 'CSS Transfer Size',
        format: size.format
      },
      image: {
        path: 'statistics.contentTypes.image.transferSize.median',
        summaryPath: 'contentTypes.image.transferSize',
        runPath: 'contentTypes.iamge.transferSize',
        name: 'Image Transfer Size',
        format: size.format
      },
      font: {
        path: 'statistics.contentTypes.font.transferSize.median',
        summaryPath: 'contentTypes.font.transferSize',
        runPath: 'contentTypes.font.transferSize',
        name: 'Font Transfer Size',
        format: size.format
      },
      favicon: {
        path: 'statistics.contentTypes.favicon.transferSize.median',
        summaryPath: 'contentTypes.favicon.transferSize',
        runPath: 'contentTypes.favicon.transferSize',
        name: 'Favicon Transfer Size',
        format: size.format
      },
      json: {
        path: 'statistics.contentTypes.json.transferSize.median',
        summaryPath: 'contentTypes.json.transferSize',
        runPath: 'contentTypes.json.transferSize',
        name: 'JSON Transfer Size',
        format: size.format
      },
      other: {
        path: 'statistics.contentTypes.other.transferSize.median',
        summaryPath: 'contentTypes.other.transferSize',
        runPath: 'contentTypes.other.transferSize',
        name: 'Other Transfer Size',
        format: size.format
      },
      plain: {
        path: 'statistics.contentTypes.plain.transferSize.median',
        summaryPath: 'contentTypes.plain.transferSize',
        runPath: 'contentTypes.plain.transferSize',
        name: 'Plain Transfer Size',
        format: size.format
      },
      svg: {
        path: 'statistics.contentTypes.svg.transferSize.median',
        summaryPath: 'contentTypes.svg.transferSize',
        runPath: 'contentTypes.svg.transferSize',
        name: 'SVG Transfer Size',
        format: size.format
      }
    },
    contentSize: {
      total: {
        path: 'statistics.contentSize.median',
        summaryPath: 'contentSize',
        runPath: 'contentSize',
        name: 'Total Content Size',
        format: size.format
      },
      html: {
        path: 'statistics.contentTypes.html.contentSize.median',
        summaryPath: 'contentTypes.html.contentSize',
        runPath: 'contentTypes.html.contentSize',
        name: 'HTML Content Size',
        format: size.format
      },
      javascript: {
        path: 'statistics.contentTypes.javascript.contentSize.median',
        summaryPath: 'contentTypes.javascript.contentSize',
        runPath: 'contentTypes.javascript.contentSize',
        name: 'JavaScript Content Size',
        format: size.format
      },
      css: {
        path: 'statistics.contentTypes.css.contentSize.median',
        summaryPath: 'contentTypes.css.contentSize',
        runPath: 'contentTypes.css.contentSize',
        name: 'CSS Content Size',
        format: size.format
      },
      image: {
        path: 'statistics.contentTypes.image.contentSize.median',
        summaryPath: 'contentTypes.image.contentSize',
        runPath: 'contentTypes.image.contentSize',
        name: 'Image Content Size',
        format: size.format
      },
      font: {
        path: 'statistics.contentTypes.font.contentSize.median',
        summaryPath: 'contentTypes.font.contentSize',
        runPath: 'contentTypes.font.contentSize',
        name: 'Font Content Size',
        format: size.format
      },
      favicon: {
        path: 'statistics.contentTypes.favicon.contentSize.median',
        summaryPath: 'contentTypes.favicon.contentSize',
        runPath: 'contentTypes.favicon.contentSize',
        name: 'Favicon Content Size',
        format: size.format
      },
      json: {
        path: 'statistics.contentTypes.json.contentSize.median',
        summaryPath: 'contentTypes.json.contentSize',
        runPath: 'contentTypes.json.contentSize',
        name: 'JSON Content Size',
        format: size.format
      },
      other: {
        path: 'statistics.contentTypes.other.contentSize.median',
        summaryPath: 'contentTypes.other.contentSize',
        runPath: 'contentTypes.other.contentSize',
        name: 'Other Content Size',
        format: size.format
      },
      plain: {
        path: 'statistics.contentTypes.plain.contentSize.median',
        summaryPath: 'contentTypes.plain.contentSize',
        runPath: 'contentTypes.plain.contentSize',
        name: 'Plain Content Size',
        format: size.format
      },
      svg: {
        path: 'statistics.contentTypes.svg.contentSize.median',
        summaryPath: 'contentTypes.svg.contentSize',
        runPath: 'contentTypes.svg.contentSize',
        name: 'SVG Content Size',
        format: size.format
      }
    },
    thirdParty: {
      transferSize: {
        path: 'statistics.thirdParty.transferSize.median',
        summaryPath: 'thirdParty.transferSize',
        runPath: 'thirdParty.transferSize',
        name: 'Third Party Transfer Size',
        format: size.format
      },
      requests: {
        path: 'statistics.thirdParty.requests.median',
        summaryPath: 'thirdParty.requests',
        runPath: 'thirdParty.requests',
        name: 'Third Party Requests',
        format: noop
      }
    },
    firstParty: {
      requests: {
        path: 'statistics.firstParty.requests.median',
        summaryPath: 'firstParty.requests',
        runPath: 'firstParty.requests',
        name: 'First Party Requests',
        format: noop
      },
      transferSize: {
        path: 'statistics.firstParty.transferSize.median',
        summaryPath: 'firstParty.transferSize',
        runPath: 'firstParty.transferSize',
        name: 'First Party Total Transfer Size',
        format: size.format
      },
      contentSize: {
        path: 'statistics.firstParty.contentSize.median',
        summaryPath: 'firstParty.contentSize',
        runPath: 'firstParty.contentSize',
        name: 'First Party Total Content Size',
        format: size.format
      }
    }
  },
  coach: {
    score: {
      score: {
        path: 'advice.score',
        summaryPath: 'score',
        name: 'Coach Overall Score',
        format: noop
      },
      bestpractice: {
        path: 'advice.bestpractice.score',
        summaryPath: 'bestpractice.score',
        name: 'Coach Best Practice Score',
        format: noop
      },
      privacy: {
        path: 'advice.privacy.score',
        summaryPath: 'privacy.score',
        name: 'Coach Privacy Score',
        format: noop
      },
      performance: {
        path: 'advice.performance.score',
        summaryPath: 'performance.score',
        name: 'Coach Performance Score',
        format: noop
      }
    }
  },
  lighthouse: {
    lighthouse: {
      performance: {
        path: 'categories.performance.score',
        name: 'Lighthouse Performance Score',
        format: noop
      },
      accessibility: {
        path: 'categories.accessibility.score',
        name: 'Lighthouse Accessibility Score',
        format: noop
      },
      'best-practices': {
        path: 'categories.best-practices.score',
        name: 'Lighthouse Best Practices Score',
        format: noop
      },
      seo: {
        path: 'categories.seo.score',
        name: 'Lighthouse SEO Score',
        format: noop
      },
      pwa: {
        path: 'categories.pwa.score',
        name: 'Lighthouse PWA Score',
        format: noop
      }
    }
  },
  gpsi: {
    gpsi: {
      performance: {
        path: 'score.performance',
        name: 'GPSI Performance Score',
        format: noop
      },
      accessibility: {
        path: 'score.accessibility',
        name: 'GPSI Accessibility Score',
        format: noop
      },
      'best-practices': {
        path: 'score.best-practices',
        name: 'GPSI Best Practices Score',
        format: noop
      },
      seo: {
        path: 'score.seo',
        name: 'GPSI SEO Score',
        format: noop
      },
      pwa: {
        path: 'score.pwa',
        name: 'GPSI PWA Score',
        format: noop
      }
    }
  },
  sustainable: {
    sustainable: {
      totalCO2: {
        path: 'totalCO2.median',
        summaryPath: 'totalCO2',
        name: 'Total CO2',
        format: co2.format
      },
      co2PerPageView: {
        path: 'co2PerPageView.median',
        summaryPath: 'co2PerPageView',
        name: 'CO2 per page view',
        format: co2.format
      },
      co2FirstParty: {
        path: 'co2FirstParty.median',
        summaryPath: 'co2FirstParty',
        name: 'CO2 per first parties',
        format: co2.format
      },
      co2ThirdParty: {
        path: 'co2ThirdParty.median',
        summaryPath: 'co2ThirdParty',
        name: 'CO2 per third parties',
        format: co2.format
      }
    }
  },
  axe: {
    axe: {
      critical: {
        path: 'violations.critical.median',
        summaryPath: 'violations.critical',
        name: 'AXE Critical Violations',
        format: noop
      },
      serious: {
        path: 'violations.serious.median',
        summaryPath: 'violations.serious',
        name: 'AXE Serious Violations',
        format: noop
      },
      minor: {
        path: 'violations.minor.median',
        summaryPath: 'violations.minor',
        name: 'AXE Minor Violations',
        format: noop
      },
      moderate: {
        path: 'violations.moderate.median',
        summaryPath: 'violations.moderate',
        name: 'AXE Moderate Violations',
        format: noop
      }
    }
  }
};
