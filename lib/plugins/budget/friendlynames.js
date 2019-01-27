'use strict';

module.exports = {
  browsertime: {
    timings: {
      firstPaint: 'statistics.timings.firstPaint.median',
      fullyLoaded: 'statistics.timings.fullyLoaded.median',
      FirstVisualChange: 'statistics.visualMetrics.FirstVisualChange.median',
      LastVisualChange: 'statistics.visualMetrics.LastVisualChange.median',
      SpeedIndex: 'statistics.visualMetrics.SpeedIndex.median',
      PerceptualSpeedIndex:
        'statistics.visualMetrics.PerceptualSpeedIndex.median',
      VisualReadiness: 'statistics.visualMetrics.VisualReadiness.median',
      VisualComplete95: 'statistics.visualMetrics.VisualComplete95.median'
    }
  },
  pagexray: {
    requests: {
      total: 'requests',
      html: 'contentTypes.html.requests',
      javascript: 'contentTypes.javascript.requests',
      css: 'contentTypes.css.requests',
      image: 'contentTypes.image.requests',
      font: 'contentTypes.font.requests'
    },
    transferSize: {
      total: 'transferSize',
      html: 'contentTypes.html.transferSize',
      javascript: 'contentTypes.javascript.transferSize',
      css: 'contentTypes.css.transferSize',
      image: 'contentTypes.image.transferSize',
      font: 'contentTypes.font.transferSize'
    },
    thirdParty: {
      transferSize: 'thirdParty.transferSize',
      requests: 'thirdParty.requests'
    }
  },
  coach: {
    score: {
      accessibility: 'advice.accessibility.score',
      bestpractice: 'advice.bestpractice.score',
      privacy: 'advice.privacy.score',
      performance: 'advice.performance.score'
    }
  }
};
