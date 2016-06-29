'use strict';

const h = require('../helpers');
const chunk = require('lodash.chunk');

function infoBox(stat, name, formatter) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return _box(stat, name, 'info', formatter)
}

function scoreBox(stat, name) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return _box(stat, name, h.scoreLabel(stat.median))
}

function metricBox(stat, name, score, formatter) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return _box(stat, name, h.scoreLabel(score.median), formatter)
}

function _box(stat, name, label, formatter) {
  const median = formatter ? formatter(stat.median) : stat.median;
  const p90 = formatter ? formatter(stat.p90) : stat.p90;

  return {
    name,
    label,
    median,
    p90
  }
}

module.exports = function(data) {
  if (!data) {
    return [];
  }

  const boxes = [];
  const coach = data.coach;
  const pagexray = data.pagexray;
  const browsertime = data.browsertime;
  const webpagetest = data.webpagetest;

  // coach
  if (coach) {
    const summary = coach.summary;

    boxes.push(
      scoreBox(summary.score, 'Overall score'),
      scoreBox(summary.performance.score, 'Performance score'),
      scoreBox(summary.accessibility.score, 'Accessibility score'),
      scoreBox(summary.bestpractice.score, 'Best Practice score'),
      scoreBox(summary.performance.fastRender, 'Fast Render advice'),
      scoreBox(summary.performance.avoidScalingImages, 'Avoid scaling images advice'),
      scoreBox(summary.performance.compressAssets, 'Compress assets advice'));
  }

  if (pagexray && coach) {
    const cSum = coach.summary;
    const pxSum = pagexray.summary;

    boxes.push(
      metricBox(pxSum.transferSize, 'Total size (transfer)',
        cSum.performance.pageSize, h.size.format),
      metricBox(pxSum.contentTypes.image.transferSize, 'Image size (transfer)',
        cSum.performance.imageSize, h.size.format),
      metricBox(pxSum.contentTypes.javascript.transferSize, 'Javascript size (transfer)',
        cSum.performance.javascriptSize, h.size.format),
      metricBox(pxSum.contentTypes.css.transferSize, 'Optimal CSS size (transfer)',
        cSum.performance.optimalCssSize, h.size.format));
  }

  // no matching rules
  if (pagexray) {
    const summary = pagexray.summary;

    boxes.push(
      infoBox(summary.requests, 'Total requests'),
      infoBox(summary.contentTypes.image.requests, 'Image requests'),
      infoBox(summary.contentTypes.css.requests, 'CSS requests'),
      infoBox(summary.contentTypes.javascript.requests, 'Javascript requests'),
      infoBox(summary.contentTypes.font.requests, 'Font requests'),
      infoBox(summary.responseCodes['200'], '200 responses'),
      infoBox(summary.responseCodes['301'], '301 responses'),
    // TODO if we have more than ZERO it should be red
      infoBox(summary.responseCodes['404'], '404 responses'),
      infoBox(summary.domains, 'Domains per page'),
      infoBox(summary.expireStats, 'Cache time', h.time.duration),
      infoBox(summary.lastModifiedStats, 'Time since last modification', h.time.duration));

    if (summary.firstParty) {
      boxes.push(
        infoBox(summary.firstParty.requests, '1st party requests'),
        infoBox(summary.thirdParty.requests, '3rd party requests'),
        infoBox(summary.firstParty.transferSize, '1st party size', h.size.format),
        infoBox(summary.thirdParty.transferSize, '3rd party sizes', h.size.format));
    }
  }

  if (browsertime) {
    const summary = browsertime.summary;

    boxes.push(
      infoBox(summary.rumSpeedIndex, 'RUM Speed Index'),
      infoBox(summary.firstPaint, 'First Paint'),
      infoBox(summary.timings.backEndTime, 'Backend Time'));

    if (summary.visualMetrics) {
      boxes.push(
        infoBox(summary.visualMetrics.FirstVisualChange, 'First Visual Change', h.time.duration),
        infoBox(summary.visualMetrics.SpeedIndex, 'Speed Index'),
        infoBox(summary.visualMetrics.LastVisualChange, 'Last Visual Change', h.time.duration));
    }
  }

  if (webpagetest) {
    const summary = webpagetest.summary;

    boxes.push(
      infoBox(summary.firstView.render, 'WPT render (firstView)'),
      infoBox(summary.firstView.SpeedIndex, 'WPT SpeedIndex (firstView)'),
      infoBox(summary.firstView.fullyLoaded, 'WPT Fully loaded (firstView)'));
  }

  return chunk(boxes.filter(Boolean), 3);
};
