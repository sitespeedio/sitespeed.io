'use strict';

const forEach = require('lodash.foreach'),
  statsHelpers = require('../../support/statsHelpers');

const timings = ['firstPaint','fullyLoaded','rumSpeedIndex'];

module.exports = {
  statsPerType: {},

  addToAggregate(browsertimeRunData) {

    forEach(timings,(timing) => {
      if (browsertimeRunData.timings[timing]) {
        statsHelpers.pushStats(this.statsPerType, timing, browsertimeRunData.timings[timing]);
      }
    })

    forEach(browsertimeRunData.timings.navigationTiming, (value, name) => {
        statsHelpers.pushStats(this.statsPerType, ['navigationTiming', name], value);
    });

    forEach(browsertimeRunData.timings.timings, (value, name) => {
        statsHelpers.pushStats(this.statsPerType, ['timings', name], value);
    });

    forEach(browsertimeRunData.timings.userTimings.marks, (timing) => {
        statsHelpers.pushStats(this.statsPerType, ['userTimings', 'marks', timing.name], timing.startTime);
    });

    forEach(browsertimeRunData.timings.userTimings.measures, (timing) => {
        statsHelpers.pushStats(this.statsPerType, ['userTimings', 'measures', timing.name], timing.duration);
    });

    forEach(browsertimeRunData.visualMetrics, (value, name) => {
        if (name !== 'VisualProgress') {
          statsHelpers.pushStats(this.statsPerType, ['visualMetrics', name], value);
        }
    });

  },
  summarize() {
  return Object.keys(this.statsPerType).reduce((summary, name) => {
    if (timings.indexOf(name) > -1 ) {
      statsHelpers.setStatsSummary(summary, name, this.statsPerType[name])
    }
    else if ('userTimings'.indexOf(name) > -1 ) {
      summary.userTimings = {};
      const marksData = {}, measuresData = {};
      forEach(this.statsPerType.userTimings.marks, (stats, timingName) => {
        statsHelpers.setStatsSummary(marksData, timingName, stats)
      });
      forEach(this.statsPerType.userTimings.measures, (stats, timingName) => {
        statsHelpers.setStatsSummary(measuresData, timingName, stats)
      });
      summary.userTimings.marks = marksData;
      summary.userTimings.measures = measuresData;
    }
    else {
      const categoryData = {};
      forEach(this.statsPerType[name], (stats, timingName) => {
        statsHelpers.setStatsSummary(categoryData, timingName, stats)
      });
      summary[name] = categoryData;
    }

    return summary;
  }, {});
  }
};
