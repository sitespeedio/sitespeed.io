'use strict';
const h = require('../helpers');

function box(name, metric, label, helper) {
  return {
    name,
    label: label ? label : 'info',
    large: metric ? metric.median : 0,
    small: metric ? metric.p90 : 0,
    helper
  }
}

module.exports = function(data) {
  const boxes = [];
  const coach = data.coach;
  const pagexray = data.pagexray;
  const browsertime = data.browsertime;
  const webpagetest = data.webpagetest;
  const metricForScore = 'median';

  // coach
  if (coach) {
    boxes.push(box('Overall score', coach.summary.score, h.scoreLabel(coach.summary.score[metricForScore])));

    boxes.push(box('Performance score', coach.summary.performance.score, h.scoreLabel(coach.summary.performance.score[metricForScore])));

    boxes.push(box('Accessibility score', coach.summary.accessibility.score, h.scoreLabel(coach.summary.accessibility.score[metricForScore])));

    boxes.push(box('Best Practice score', coach.summary.bestpractice.score, h.scoreLabel(coach.summary.bestpractice.score[metricForScore])));

    boxes.push(box('Fast Render advice', coach.summary.performance.fastRender, h.scoreLabel(coach.summary.performance.fastRender[metricForScore])));

    boxes.push(box('Avoid scaling images advice', coach.summary.performance.avoidScalingImages, h.scoreLabel(coach.summary.performance.avoidScalingImages[metricForScore])));

    boxes.push(box('Compress assets advice', coach.summary.performance.compressAssets, h.scoreLabel(coach.summary.performance.compressAssets[metricForScore])));
  }

  if (pagexray && coach) {
    boxes.push(box('Total size (transfer)', pagexray.summary.transferSize, h.scoreLabel(coach.summary.performance.pageSize[metricForScore]), h.size.format));

    boxes.push(box('Image size (transfer)', pagexray.summary.contentTypes.image.transferSize, h.scoreLabel(coach.summary.performance.imageSize[metricForScore]), h.size.format));

    boxes.push(box('Javascript size (transfer)', pagexray.summary.contentTypes.javascript.transferSize, h.scoreLabel(coach.summary.performance.javascriptSize[metricForScore]), h.size.format));

    boxes.push(box('Optimal CSS size (transfer)', pagexray.summary.contentTypes.css.transferSize, h.scoreLabel(coach.summary.performance.optimalCssSize[metricForScore]), h.size.format));

  }

  // no matching rules
  if (pagexray) {
    boxes.push(box('Total requests', pagexray.summary.requests, undefined, undefined));
    boxes.push(box('Image requests', pagexray.summary.contentTypes.image.requests, undefined, undefined));
    boxes.push(box('CSS requests', pagexray.summary.contentTypes.css.requests, undefined, undefined));
    boxes.push(box('Javascript requests', pagexray.summary.contentTypes.javascript.requests, undefined, undefined));
    boxes.push(box('Font requests', pagexray.summary.contentTypes.font.requests, undefined, undefined));

    boxes.push(box('200 responses', pagexray.summary.responseCodes['200'], undefined, undefined));
    boxes.push(box('310 responses', pagexray.summary.responseCodes['301'], undefined, undefined));
    // TODO if we have more than ZERO it should be red
    boxes.push(box('404 responses', pagexray.summary.responseCodes['404'], undefined, undefined));

    boxes.push(box('Domains per page', pagexray.summary.domains, undefined, undefined));

    boxes.push(box('Cache time', pagexray.summary.expireStats, undefined, h.time.duration));

    boxes.push(box('Time since last modification', pagexray.summary.lastModifiedStats, undefined, h.time.duration));
  }

  if (pagexray.summary.firstParty ) {
    boxes.push(box('1st party requests', pagexray.summary.firstParty.requests, undefined, undefined));
    boxes.push(box('3rd party requests', pagexray.summary.thirdParty.requests, undefined, undefined));
    boxes.push(box('1st party size', pagexray.summary.firstParty.transferSize, undefined, h.size.format));
    boxes.push(box('3rd party sizes', pagexray.summary.thirdParty.transferSize, undefined, h.size.format));
  }

  if (browsertime) {

    boxes.push(box('RUM Speed Index', browsertime.summary.rumSpeedIndex, undefined, undefined));
    boxes.push(box('First Paint', browsertime.summary.firstPaint, undefined, undefined));
    boxes.push(box('Backend Time', browsertime.summary.timings.backEndTime, undefined, undefined));
    if (browsertime.summary.visualMetrics) {

      boxes.push(box('First Visual Change', browsertime.summary.visualMetrics.FirstVisualChange, undefined, undefined));
      boxes.push(box('Speed Index', browsertime.summary.visualMetrics.SpeedIndex, undefined, undefined));
      boxes.push(box('Last Visual Change', browsertime.summary.visualMetrics.LastVisualChange, undefined, undefined));

    }
  }

  if (webpagetest) {
    boxes.push(box('WPT render (firstView)', webpagetest.summary.firstView.render, undefined, undefined));
    boxes.push(box('WPT SpeedIndex (firstView)', webpagetest.summary.firstView.SpeedIndex, undefined, undefined));
    boxes.push(box('WPT Fully loaded (firstView)', webpagetest.summary.firstView.fullyLoaded, undefined, undefined));
  }

  const rows = [];

  while (boxes.length > 0) {
    rows.push(boxes.splice(0,3));
  }

  return rows;

}
