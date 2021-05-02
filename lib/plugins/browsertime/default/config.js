'use strict';

module.exports = {
  browser: 'chrome',
  iterations: 3,
  connectivity: {
    profile: 'native',
    downstreamKbps: undefined,
    upstreamKbps: undefined,
    latency: undefined,
    engine: 'external'
  },
  screenshot: true,
  screenshotLCP: true,
  screenshotLS: true,
  screenshotParams: {
    type: 'png',
    png: {
      compressionLevel: 6
    },
    jpg: {
      quality: 80
    },
    maxSize: 2000
  },
  viewPort: '1366x708',
  delay: 0,
  xvfbParams: {
    display: 99
  }
};
