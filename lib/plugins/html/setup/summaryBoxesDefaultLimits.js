export default {
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
  timings: {
    firstPaint: { green: 1000, yellow: 2000 },
    firstContentfulPaint: { green: 2000, yellow: 4000 },
    largestContentfulPaint: { green: 2500, yellow: 4000 },
    backEndTime: { green: 800, yellow: 1800 },
    fullyLoaded: {},
    pageLoadTime: {},
    FirstVisualChange: { green: 1000, yellow: 2000 },
    LastVisualChange: {},
    SpeedIndex: { green: 2000, yellow: 3000 },
    PerceptualSpeedIndex: {},
    VisualReadiness: { green: 500, yellow: 1000 },
    VisualComplete: {}
  },
  googleWebVitals: {
    cumulativeLayoutShift: { green: 0.1, yellow: 0.25 }
  },
  requests: {
    total: { green: 80, yellow: 200 },
    javascript: {},
    css: {},
    image: {}
  },
  transferSize: {
    total: { green: 1_000_000, yellow: 1_500_000 },
    html: {},
    css: {},
    image: {},
    javascript: {}
  },
  contentSize: {
    javascript: { green: 100_000, yellow: 150_000 }
  },
  thirdParty: {
    requests: {},
    transferSize: {}
  },
  axe: {
    critical: { green: 1, yellow: 2 },
    serious: { green: 1, yellow: 2 },
    minor: { green: 1, yellow: 2 },
    moderate: { green: 1, yellow: 2 }
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
