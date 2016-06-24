'use strict';
const h = require('../helpers');

module.exports = function(data) {
  var metrics = [];
  if (data.coach) {
    metrics.push({
      name: 'Coach score',
      node: data.coach.summary.score,
      h: h.noop
    }, {
      name: 'Coach performance score',
      node: data.coach.summary.performance.score,
      h: h.noop
    }, {
      name: 'Accessibility score',
      node: data.coach.summary.accessibility.score,
      h: h.noop
    }, {
      name: 'Best Practice score',
      node: data.coach.summary.bestpractice.score,
      h: h.noop
    });
  }

  if (data.pagexray) {
    metrics.push({
      name: 'Image requests',
      node: data.pagexray.summary.contentTypes.image.requests,
      h: h.noop
    }, {
      name: 'CSS requests',
      node: data.pagexray.summary.contentTypes.css.requests,
      h: h.noop
    }, {
      name: 'Javascript requests',
      node: data.pagexray.summary.contentTypes.javascript.requests,
      h: h.noop
    }, {
      name: 'Font requests',
      node: data.pagexray.summary.contentTypes.font.requests,
      h: h.noop
    }, {
      name: 'Total requests',
      node: data.pagexray.summary.requests,
      h: h.noop
    })

    metrics.push({
      name: 'Image size',
      node: data.pagexray.summary.contentTypes.image.transferSize,
      h: h.size.format
    }, {
      name: 'HTML size',
      node: data.pagexray.summary.contentTypes.html.transferSize,
      h: h.size.format
    }, {
      name: 'CSS size',
      node: data.pagexray.summary.contentTypes.css.transferSize,
      h: h.size.format
    }, {
      name: 'Javascript size',
      node: data.pagexray.summary.contentTypes.javascript.transferSize,
      h: h.size.format
    }, {
      name: 'Font size',
      node: data.pagexray.summary.contentTypes.font.transferSize,
      h: h.size.format
    }, {
      name: 'Total size',
      node: data.pagexray.summary.transferSize,
      h: h.size.format
    })

    const responseCodes = Object.keys(data.pagexray.summary.responseCodes);
    for (var code of responseCodes) {
      metrics.push({
        name: code + ' responses',
        node: data.pagexray.summary.responseCodes[code],
        h: h.noop
      })
    }
  }

  if (data.browsertime) {
    metrics.push({
      name: 'RUMSpeed Index',
      node: data.browsertime.summary.rumSpeedIndex,
      h: h.noop
    }, {
      name: 'First Paint',
      node: data.browsertime.summary.firstPaint,
      h: h.noop
    }, {
      name: 'Fully loaded',
      node: data.browsertime.summary.fullyLoaded,
      h: h.noop
    })
  }

  if (data.browsertime) {
    const timings = Object.keys(data.browsertime.summary.timings);
    for (var timing of timings) {
      metrics.push({
        name: timing,
        node: data.browsertime.summary.timings[timing],
        h: h.noop
      })
    }
  }

  if (data.webpagetest) {
    metrics.push({
      name: 'WPT render (firstView)',
      node: data.webpagetest.summary.firstView.render,
      h: h.noop
    }, {
      name: 'WPT SpeedIndex (firstView)',
      node: data.webpagetest.summary.firstView.SpeedIndex,
      h: h.noop
    }, {
      name: 'WPT Fully loaded (firstView)',
      node: data.webpagetest.summary.firstView.fullyLoaded,
      h: h.noop
    })
  }
  return metrics;
}
