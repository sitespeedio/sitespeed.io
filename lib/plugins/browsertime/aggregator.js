'use strict';

const forEach = require('lodash.foreach'),
  statsHelpers = require('../../support/statsHelpers');

const timings = ['firstPaint', 'fullyLoaded', 'rumSpeedIndex'];

module.exports = {
  statsPerType: {},
  groups: {},

  addToAggregate(browsertimeRunData, group) {
    if (this.groups[group] === undefined) {
      this.groups[group] = {};
    }

    forEach(timings, timing => {
      if (browsertimeRunData.timings[timing]) {
        statsHelpers.pushGroupStats(
          this.statsPerType,
          this.groups[group],
          timing,
          browsertimeRunData.timings[timing]
        );
      }
    });

    forEach(browsertimeRunData.timings.navigationTiming, (value, name) => {
      statsHelpers.pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['navigationTiming', name],
        value
      );
    });

    // pick up one level of custom metrics
    forEach(browsertimeRunData.custom, (value, name) => {
      statsHelpers.pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['custom', name],
        value
      );
    });

    forEach(browsertimeRunData.timings.pageTimings, (value, name) => {
      statsHelpers.pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['pageTimings', name],
        value
      );
    });

    forEach(browsertimeRunData.timings.userTimings.marks, timing => {
      statsHelpers.pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['userTimings', 'marks', timing.name],
        timing.startTime
      );
    });

    forEach(browsertimeRunData.timings.userTimings.measures, timing => {
      statsHelpers.pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['userTimings', 'measures', timing.name],
        timing.duration
      );
    });

    forEach(browsertimeRunData.visualMetrics, (value, name) => {
      if (name !== 'VisualProgress') {
        statsHelpers.pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['visualMetrics', name],
          value
        );
      }
    });
  },
  summarize() {
    if (Object.keys(this.statsPerType).length === 0) {
      return undefined;
    }

    const summary = {
      groups: {
        total: this.summarizePerObject(this.statsPerType)
      }
    };

    for (let group of Object.keys(this.groups)) {
      summary.groups[group] = this.summarizePerObject(this.groups[group]);
    }
    return summary;
  },

  summarizePerObject(obj) {
    return Object.keys(obj).reduce((summary, name) => {
      if (timings.indexOf(name) > -1) {
        statsHelpers.setStatsSummary(summary, name, obj[name]);
      } else if ('userTimings'.indexOf(name) > -1) {
        summary.userTimings = {};
        const marksData = {},
          measuresData = {};
        forEach(obj.userTimings.marks, (stats, timingName) => {
          statsHelpers.setStatsSummary(marksData, timingName, stats);
        });
        forEach(obj.userTimings.measures, (stats, timingName) => {
          statsHelpers.setStatsSummary(measuresData, timingName, stats);
        });
        summary.userTimings.marks = marksData;
        summary.userTimings.measures = measuresData;
      } else {
        const categoryData = {};
        forEach(obj[name], (stats, timingName) => {
          statsHelpers.setStatsSummary(categoryData, timingName, stats);
        });
        summary[name] = categoryData;
      }

      return summary;
    }, {});
  }
};
