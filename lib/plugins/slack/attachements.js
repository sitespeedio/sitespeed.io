'use strict';

const h = require('../../support/helpers');

module.exports = {
  get(dataCollection) {

    const attachements = [];

    for (let url of Object.keys(dataCollection.urlPages)) {
      
      const path = dataCollection.urlPages[url].data;
      const firstPaint = path.browsertime.pageSummary.statistics.timings.firstPaint;
      const rumSpeedIndex = path.browsertime.pageSummary.statistics.timings.rumSpeedIndex;
      const pageLoadTime = path.browsertime.pageSummary.statistics.timings.pageTimings.pageLoadTime;
      const score = path.browsertime.pageSummary.statistics.coach.coachAdvice.advice.performance.score;
      const pageWeight = path.pagexray.pageSummary.transferSize;
      const pageReuqests = path.pagexray.pageSummary.requests;

      attachements.push({
        color: score.median > 90 ? 'good' : score.median > 80 ? 'warning' : 'danger',
        // pretext: url,
        text: url,
        "fields": [{
          "title": "firstPaint",
          "value": firstPaint.median + ' ms' + ' (' + firstPaint.max + ')',
          "short": true
        }, {
          "title": "rumSpeedIndex",
          "value": rumSpeedIndex.median + ' ms' + ' (' + rumSpeedIndex.max + ')',
          "short": true
        }, {
          "title": "onLoadTime",
          "value": pageLoadTime.median + ' ms' + ' (' + pageLoadTime.max + ')',
          "short": true
        }, {
          "title": "Coach score",
          "value": score.median,
          "short": true
        }, {
          "title": "Page weight",
          "value": h.size.format(pageWeight),
          "short": true
        }, {
          "title": "Requests",
          "value": pageReuqests,
          "short": true
        }]
      });
    }
    return attachements;
  }
}
