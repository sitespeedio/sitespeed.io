'use strict';
const h = require('../helpers');

function row(stat, name, formatter) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return {
    name,
    node: stat,
    h: formatter ? formatter : h.noop
  }
}

module.exports = function(data) {
  if (!data) {
    return [];
  }

  const rows = [];

  const coach = data.coach;
  const pagexray = data.pagexray;
  const browsertime = data.browsertime;
  const webpagetest = data.webpagetest;

  if (coach) {
    const summary = coach.summary;

    rows.push(
      row(summary.score, 'Coach score'),
      row(summary.performance.score, 'Coach performance score'),
      row(summary.accessibility.score, 'Accessibility score'),
      row(summary.bestpractice.score, 'Best Practice score')
    );
  }

  if (pagexray) {
    const summary = pagexray.summary;
    const contentTypes = summary.contentTypes;

    rows.push(
      row(contentTypes.image.requests, 'Image requests'),
      row(contentTypes.css.requests, 'CSS requests'),
      row(contentTypes.javascript.requests, 'Javascript requests'),
      row(contentTypes.font.requests, 'Font requests'),
      row(summary.requests, 'Total requests')
    );

    rows.push(
      row(contentTypes.image.transferSize, 'Image size', h.size.format),
      row(contentTypes.html.transferSize, 'HTML size', h.size.format),
      row(contentTypes.css.transferSize, 'CSS size', h.size.format),
      row(contentTypes.javascript.transferSize, 'Javascript size', h.size.format),
      row(contentTypes.font.transferSize, 'Font size', h.size.format),
      row(summary.transferSize, 'Total size', h.size.format));

    const responseCodes = Object.keys(summary.responseCodes);
    for (let code of responseCodes) {
      rows.push(row(summary.responseCodes[code], code + ' responses'))
    }
  }

  if (browsertime) {
    const summary = browsertime.summary;

    rows.push(
      row(summary.rumSpeedIndex, 'RUMSpeed Index'),
      row(summary.firstPaint, 'First Paint'),
      row(summary.fullyLoaded, 'Fully loaded'));

    const timings = Object.keys(summary.timings);
    for (let timing of timings) {
      rows.push(row(summary.timings[timing], timing))
    }
  }

  if (webpagetest) {
    const summary = webpagetest.summary;
    rows.push(
      row(summary.firstView.render, 'WPT render (firstView)'),
      row(summary.firstView.SpeedIndex, 'WPT SpeedIndex (firstView)'),
      row(summary.firstView.fullyLoaded, 'WPT Fully loaded (firstView)'));
  }

  return rows.filter(Boolean);
};
