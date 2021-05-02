'use strict';
module.exports = {
  score: {
    score: {
      green: 90,
      yellow: 80
    },
    accessibility: {
      green: 90,
      yellow: 80
    },
    bestpractice: {
      green: 90,
      yellow: 80
    },
    privacy: {
      green: 90,
      yellow: 80
    },
    performance: {
      green: 90,
      yellow: 80
    }
  },
  // All timings are in ms
  timings: {
    firstPaint: { green: 1000, yellow: 2000 },
    firstContentfulPaint: { green: 2000, yellow: 4000 },
    largestContentfulPaint: { green: 2500, yellow: 4000 },
    fullyLoaded: {},
    pageLoadTime: {},
    FirstVisualChange: { green: 1000, yellow: 2000 },
    LastVisualChange: {},
    SpeedIndex: { green: 2000, yellow: 3000 },
    PerceptualSpeedIndex: {},
    VisualReadiness: { green: 500, yellow: 1000 },
    VisualComplete: {}
  },
  pageinfo: {
    cumulativeLayoutShift: {}
  },
  requests: {
    total: { green: 80, yellow: 200 },
    javascript: {},
    css: {},
    image: {}
  },
  // Size in byte
  transferSize: {
    total: { green: 1000000, yellow: 1500000 },
    html: {},
    css: {},
    image: {},
    javascript: {}
  },
  contentSize: {
    javascript: { green: 100000, yellow: 150000 }
  },
  thirdParty: {
    requests: {},
    transferSize: {}
  },
  axe: {
    critical: { green: 0, yellow: 1 },
    serious: { green: 0, yellow: 1 },
    minor: { green: 0, yellow: 1 },
    moderate: { green: 0, yellow: 1 }
  },
  cpu: {
    longTasks: { green: 1, yellow: 3 },
    totalBlockingTime: { green: 300, yellow: 500 },
    maxPotentialFid: { green: 1, yellow: 300 },
    longTasksTotalDuration: { green: 100, yellow: 200 }
  },
  sustainable: {
    totalCO2: {},
    co2PerPageView: {},
    co2FirstParty: {},
    co2ThirdParty: {}
  },
  webpagetest: {
    SpeedIndex: {},
    lastVisualChange: {},
    render: {},
    visualComplete: {},
    visualComplete95: {},
    fullyLoaded: {}
  }
};
