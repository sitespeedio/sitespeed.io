'use strict';
const h = require('../helpers');

module.exports = function(data) {
  var metrics = [];
  const coach = data.coach;
  const pagexray = data.pagexray;
  const browsertime = data.browsertime;
  const webpagetest = data.webpagetest;

  if (coach) {
    metrics.push({
      name: 'Coach score',
      node: coach.summary.score,
      h: h.noop
    }, {
      name: 'Coach performance score',
      node: coach.summary.performance.score,
      h: h.noop
    }, {
      name: 'Accessibility score',
      node: coach.summary.accessibility.score,
      h: h.noop
    }, {
      name: 'Best Practice score',
      node: coach.summary.bestpractice.score,
      h: h.noop
    });
  }

  if (pagexray) {
    metrics.push({
      name: 'Image requests',
      node: pagexray.summary.contentTypes.image.requests,
      h: h.noop
    }, {
      name: 'CSS requests',
      node: pagexray.summary.contentTypes.css.requests,
      h: h.noop
    }, {
      name: 'Javascript requests',
      node: pagexray.summary.contentTypes.javascript.requests,
      h: h.noop
    }, {
      name: 'Font requests',
      node: pagexray.summary.contentTypes.font.requests,
      h: h.noop
    }, {
      name: 'Total requests',
      node: pagexray.summary.requests,
      h: h.noop
    })

    metrics.push({
      name: 'Image size',
      node: pagexray.summary.contentTypes.image.transferSize,
      h: h.size.format
    }, {
      name: 'HTML size',
      node: pagexray.summary.contentTypes.html.transferSize,
      h: h.size.format
    }, {
      name: 'CSS size',
      node: pagexray.summary.contentTypes.css.transferSize,
      h: h.size.format
    }, {
      name: 'Javascript size',
      node: pagexray.summary.contentTypes.javascript.transferSize,
      h: h.size.format
    }, {
      name: 'Font size',
      node: pagexray.summary.contentTypes.font.transferSize,
      h: h.size.format
    }, {
      name: 'Total size',
      node: pagexray.summary.transferSize,
      h: h.size.format
    })

    const responseCodes = Object.keys(pagexray.summary.responseCodes);
    for (var code of responseCodes) {
      metrics.push({
        name: code + ' responses',
        node: pagexray.summary.responseCodes[code],
        h: h.noop
      })
    }
  }

  if (browsertime) {
    metrics.push({
      name: 'RUMSpeed Index',
      node: browsertime.summary.rumSpeedIndex,
      h: h.noop
    }, {
      name: 'First Paint',
      node: browsertime.summary.firstPaint,
      h: h.noop
    }, {
      name: 'Fully loaded',
      node: browsertime.summary.fullyLoaded,
      h: h.noop
    })
  }

  if (browsertime) {
    const timings = Object.keys(browsertime.summary.timings);
    for (var timing of timings) {
      metrics.push({
        name: timing,
        node: browsertime.summary.timings[timing],
        h: h.noop
      })
    }
  }

  if (webpagetest) {
    metrics.push({
      name: 'WPT render (firstView)',
      node: webpagetest.summary.firstView.render,
      h: h.noop
    }, {
      name: 'WPT SpeedIndex (firstView)',
      node: webpagetest.summary.firstView.SpeedIndex,
      h: h.noop
    }, {
      name: 'WPT Fully loaded (firstView)',
      node: webpagetest.summary.firstView.fullyLoaded,
      h: h.noop
    })
  }
  return metrics;
}
