'use strict';
const h = require('../helpers');

function row(stat, name, metricName, formatter) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return {
    name,
    metricName,
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
      row(summary.score, 'Coach score', 'overallScore'),
      row(summary.performance.score, 'Coach performance score', 'performanceScore'),
      row(summary.accessibility.score, 'Accessibility score', 'accessibilityScore'),
      row(summary.bestpractice.score, 'Best Practice score', 'bestPracticeScore')
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
      row(contentTypes.image.transferSize, 'Image size', undefined, h.size.format),
      row(contentTypes.html.transferSize, 'HTML size', undefined, h.size.format),
      row(contentTypes.css.transferSize, 'CSS size',undefined, h.size.format),
      row(contentTypes.javascript.transferSize, 'Javascript size', undefined,  h.size.format),
      row(contentTypes.font.transferSize, 'Font size', undefined, h.size.format),
      row(summary.transferSize, 'Total size', undefined, h.size.format));

    const responseCodes = Object.keys(summary.responseCodes);
    for (let code of responseCodes) {
      rows.push(row(summary.responseCodes[code], code + ' responses'))
    }
  }

  if (browsertime) {
    const summary = browsertime.summary;

    rows.push(
      row(summary.rumSpeedIndex, 'RUMSpeed Index', 'rumSpeedIndex'),
      row(summary.firstPaint, 'First Paint', 'firstPaint'),
      row(summary.fullyLoaded, 'Fully loaded', 'fullyLoaded'));

    const timings = Object.keys(summary.pageTimings);
    for (let timing of timings) {
      rows.push(row(summary.pageTimings[timing], timing, timing))
    }

    if (summary.custom) {
      for (var key of Object.keys(summary.custom)) {
        rows.push(row(summary.custom[key],key));
      }
    }
  }

  if (webpagetest) {
    const summary = webpagetest.summary.timing;
    rows.push(
      row(summary.firstView.render, 'WPT render (firstView)', 'render'),
      row(summary.firstView.SpeedIndex, 'WPT SpeedIndex (firstView)', 'SpeedIndex'),
      row(summary.firstView.fullyLoaded, 'WPT Fully loaded (firstView)', 'fullyLoaded'));
  }

  return rows.filter(Boolean);
};
