'use strict';
const h = require('./helpers');

function box(name, metric, helper) {
  return {name: name, median: metric.median, p90: metric.p90, helper: helper}
}

module.exports = {
  getBoxes(data) {
  const boxes = [];

  // coach
  boxes.push(box('Overall score', data.coach.summary.score, h.scoreLabel));
  boxes.push(box('Performance score', data.coach.summary.performance.score, h.scoreLabel));
  boxes.push(box('Accessibility score', data.coach.summary.accessibility.score, h.scoreLabel));
  return boxes;

}
};
/*
    if coach
      .row
        .one-third.column
          +box('Overall score', coach.summary.score, h.scoreLabel)
        .one-third.column
          +box('Performance score', coach.summary.performance.score, h.scoreLabel)
        .one-third.column
          +box('Accessibility score', coach.summary.accessibility.score, h.scoreLabel)

    .row
      if coach
        .one-third.column
          +box('Best Practice score', coach.summary.bestpractice.score, h.scoreLabel)
      if pagexray
        .one-third.column
          +boxInfo('Total requests', pagexray.summary.requests)
        .one-third.column
          +boxInfo('Image requests', pagexray.summary.contentTypes.image.requests)
    .row
      .one-third.column
        +boxInfo('200 responses', pagexray.summary.responseCodes['200'])
      .one-third.column
        +boxInfo('301 responses', pagexray.summary.responseCodes['301'])
      .one-third.column
        +boxInfo('404 responses', pagexray.summary.responseCodes['404'])

    if pagexray
      .row
        .one-third.column
          +boxInfo('CSS requests', pagexray.summary.contentTypes.css.requests)
        .one-third.column
          +boxInfo('Javascript requests', pagexray.summary.contentTypes.javascript.requests)
        .one-third.column
          +boxInfo('Font requests', pagexray.summary.contentTypes.font.requests)
      .row
        .one-third.column
          +boxInfo('Total size',  pagexray.summary.transferSize, h.size.format)
        .one-third.column
          +boxInfo('Image size', pagexray.summary.contentTypes.image.transferSize, h.size.format)
        .one-third.column
          +boxInfo('Javascript size', pagexray.summary.contentTypes.javascript.transferSize, h.size.format)

    if browsertime
      .row
        .one-third.column
          +boxInfo('RUM Speed Index',  browsertime.summary.rumSpeedIndex)
        .one-third.column
          +boxInfo('Fully loaded', browsertime.summary.fullyLoaded)
        if browsertime.summary.firstPaint
          .one-third.column
            +boxInfo('First Paint', browsertime.summary.firstPaint)
        else
          .one-third.column
            +boxInfo('Backend Time', browsertime.summary.timings.backEndTime)
    if browsertime && browsertime.summary.visualMetrics
      .row
        .one-third.column
          +boxInfo('First Visual Change', browsertime.summary.visualMetrics.FirstVisualChange)
        .one-third.column
          +boxInfo('Speed Index',  browsertime.summary.visualMetrics.SpeedIndex)
        .one-third.column
          +boxInfo('Last Visual Change', browsertime.summary.visualMetrics.LastVisualChange)
    if webpagetest
      .row
        .one-third.column
          +boxInfo('WPT render (firstView)',  webpagetest.summary.firstView.render)
        .one-third.column
          +boxInfo('WPT SpeedIndex (firstView)', webpagetest.summary.firstView.SpeedIndex)
        .one-third.column
          +boxInfo('WPT Fully loaded (firstView)', webpagetest.summary.firstView.fullyLoaded)

    p.small * The value inside of the parentheses are the 95th percentile (95% of the time, the number is below this amount)
    */
