'use strict';
const { noop, size, time } = require('./helpers');

module.exports = {
  browsertime: {
    timings: {
      firstPaint: {
        path: 'statistics.timings.firstPaint.median',
        name: 'First Paint',
        format: time.ms
      },
      fullyLoaded: {
        path: 'statistics.timings.fullyLoaded.median',
        name: 'Fully Loaded',
        format: time.ms
      },
      pageLoadTime: {
        path: 'statistics.timings.pageTimings.pageLoadTime.median',
        name: 'Page Load Time',
        format: time.ms
      },
      FirstVisualChange: {
        path: 'statistics.visualMetrics.FirstVisualChange.median',
        name: 'First Visual Change',
        format: time.ms
      },
      LastVisualChange: {
        path: 'statistics.visualMetrics.LastVisualChange.median',
        name: 'Last Visual Change',
        format: time.ms
      },
      SpeedIndex: {
        path: 'statistics.visualMetrics.SpeedIndex.median',
        name: 'Speed Index',
        format: time.ms
      },
      PerceptualSpeedIndex: {
        path: 'statistics.visualMetrics.PerceptualSpeedIndex.median',
        name: 'Perceptual Speed Index',
        format: time.ms
      },
      VisualReadiness: {
        path: 'statistics.visualMetrics.VisualReadiness.median',
        name: 'Visual Readiness',
        format: time.ms
      },
      VisualComplete95: {
        path: 'statistics.visualMetrics.VisualComplete95.median',
        name: 'Visual Complete 95',
        format: time.ms
      }
    }
  },
  pagexray: {
    requests: {
      total: { path: 'requests', name: 'Total Requests', format: noop },
      html: {
        path: 'contentTypes.html.requests',
        name: 'HTML Requests',
        format: noop
      },
      javascript: {
        path: 'rontentTypes.javascript.requests',
        name: 'JavaScript Requests',
        format: noop
      },
      css: {
        path: 'contentTypes.css.request',
        name: 'CSS Requests',
        format: noop
      },
      image: {
        path: 'contentTypes.image.requests',
        name: 'Image Requests',
        format: noop
      },
      font: {
        path: 'contentTypes.font.requests',
        name: 'Font Requests',
        format: noop
      },
      httpErrors: { path: 'esponseCodes', name: 'HTTP Errors', format: noop }
    },
    transferSize: {
      total: {
        path: 'transferSize',
        name: 'Total Transfer Size',
        format: size.format
      },
      html: {
        path: 'contentTypes.html.transferSize',
        name: 'HTML Transfer Size',
        format: size.format
      },
      javascript: {
        path: 'contentTypes.javascript.transferSize',
        name: 'JavaScript Transfer Size',
        format: size.format
      },
      css: {
        path: 'contentTypes.css.transferSize',
        name: 'CSS Transfer Size',
        format: size.format
      },
      image: {
        path: 'contentTypes.image.transferSize',
        name: 'Image Transfer Size',
        format: size.format
      },
      font: {
        path: 'contentTypes.font.transferSize',
        name: 'FontTransfer Size',
        format: size.format
      },
      favicon: {
        path: 'contentTypes.favicon.transferSize',
        name: 'Favicon Transfer Size',
        format: size.format
      },
      json: {
        path: 'contentTypes.json.transferSize',
        name: 'JSON Transfer Size',
        format: size.format
      },
      other: {
        path: 'contentTypes.other.transferSize',
        name: 'Other Transfer Size',
        format: size.format
      },
      plain: {
        path: 'contentTypes.plain.transferSize',
        name: 'Plain Transfer Size',
        format: size.format
      },
      svg: {
        path: 'contentTypes.svg.transferSize',
        name: 'SVG Transfer Size',
        format: size.format
      }
    },
    contentSize: {
      total: {
        path: 'contentSize',
        name: 'Total Content Size',
        format: size.format
      },
      html: {
        path: 'contentTypes.html.contentSize',
        name: 'HTML Content Size',
        format: size.format
      },
      javascript: {
        path: 'contentTypes.javascript.contentSize',
        name: 'JavaScript Content Size',
        format: size.format
      },
      css: {
        path: 'contentTypes.css.contentSize',
        name: 'CSS Content Size',
        format: size.format
      },
      image: {
        path: 'contentTypes.image.contentSize',
        name: 'Image Content Size',
        format: size.format
      },
      font: {
        path: 'contentTypes.font.contentSize',
        name: 'Font Content Size',
        format: size.format
      },
      favicon: {
        path: 'contentTypes.favicon.contentSize',
        name: 'Favicon Content Size',
        format: size.format
      },
      json: {
        path: 'contentTypes.json.contentSize',
        name: 'JSON Content Size',
        format: size.format
      },
      other: {
        path: 'contentTypes.other.contentSize',
        name: 'Other Content Size',
        format: size.format
      },
      plain: {
        path: 'contentTypes.plain.contentSize',
        name: 'Plain Content Size',
        format: size.format
      },
      svg: {
        path: 'contentTypes.svg.contentSize',
        name: 'SVG Content Size',
        format: size.format
      }
    },
    thirdParty: {
      transferSize: {
        path: 'thirdParty.transferSize',
        name: 'Third Party Transfer Size',
        format: size.format
      },
      requests: {
        path: 'thirdParty.requests',
        name: 'Third Party Requests',
        format: noop
      }
    }
  },
  coach: {
    score: {
      accessibility: {
        path: 'advice.accessibility.score',
        name: 'Coach Accessibility Score',
        format: noop
      },
      bestpractice: {
        path: 'advice.bestpractice.score',
        name: 'Coach Best Practice Score',
        format: noop
      },
      privacy: {
        path: 'advice.privacy.score',
        name: 'Coach Privacy Score',
        format: noop
      },
      performance: {
        path: 'advice.performance.score',
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
        name: 'Lighthouse PWAScore',
        format: noop
      }
    }
  },
  webpagetest: {
    webpagetest: {
      SpeedIndex: {
        path: 'data.median.firstView.SpeedIndex',
        name: 'WebPageTest Speed Index',
        format: time.ms
      },
      lastVisualChange: {
        path: 'data.median.firstView.lastVisualChange',
        name: 'WebPageTest Last Visual Change',
        format: time.ms
      },
      render: {
        path: 'data.median.firstView.render',
        name: 'WebPageTest First Visual Change',
        format: time.ms
      },
      visualComplete: {
        path: 'data.median.firstView.visualComplete',
        name: 'WebPageTest Visual Complete',
        format: time.ms
      },
      visualComplete95: {
        path: 'data.median.firstView.visualComplete95',
        name: 'WebPageTest Visual Complete 95',
        format: time.ms
      },
      TTFB: {
        path: 'data.median.firstView.TTFB',
        name: 'WebPageTest TTFB',
        format: time.ms
      },
      fullyLoaded: {
        path: 'data.median.firstView.fullyLoaded',
        name: 'WebPageTest Fully Loaded',
        format: time.ms
      }
    }
  },
  gpsi: {
    gpsi: {
      speedscore: {
        path: 'ruleGroups.SPEED.score',
        name: 'GPSI Speed Score',
        format: noop
      }
    }
  },
  axe: {
    axe: {
      critical: {
        path: 'violations.critical.median',
        name: 'AXE Critical Violations',
        format: noop
      },
      serious: {
        path: 'violations.serious.median',
        name: 'AXE Serious Violations',
        format: noop
      },
      minor: {
        path: 'violations.minor.median',
        name: 'AXE Minor Violations',
        format: noop
      },
      moderate: {
        path: 'violations.moderate.median',
        name: 'AXE Moderate Violations',
        format: noop
      }
    }
  }
};
