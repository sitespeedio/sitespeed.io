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
        'statistics.visualMetrics.PerceptualSpeedIndex.median'
    }
  },
  pagexray: {
    requests: {
      total: 'requests'
    },
    size: { total: 'transferSize' },
    thirdParty: {
      transferSize: 'thirdParty.transferSize',
      requests: 'thirdParty.requests'
    }
  },

  coach: {
    score: {
      privacy: 'advice.privacy.score',
      performance: 'advice.performance.score'
    }
  }
};
