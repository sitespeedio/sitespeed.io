'use strict';

const forEach = require('lodash.foreach'),
  statsHelpers = require('../../support/statsHelpers');

const timings = ['firstPaint', 'timeToDomContentFlushed'];

module.exports = {
  statsPerType: {},
  groups: {},

  addToAggregate(browsertimeRunData, group) {
    if (this.groups[group] === undefined) {
      this.groups[group] = {};
    }

    if (browsertimeRunData.fullyLoaded) {
      statsHelpers.pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['timings', 'fullyLoaded'],
        browsertimeRunData.fullyLoaded
      );
    }

    if (browsertimeRunData.memory) {
      statsHelpers.pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['memory'],
        browsertimeRunData.memory
      );
    }

    if (browsertimeRunData.googleWebVitals) {
      for (let metric of Object.keys(browsertimeRunData.googleWebVitals)) {
        statsHelpers.pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['googleWebVitals', metric],
          browsertimeRunData.googleWebVitals[metric]
        );
      }
    }

    if (browsertimeRunData.timings.largestContentfulPaint) {
      statsHelpers.pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['timings', 'largestContentfulPaint'],
        browsertimeRunData.timings.largestContentfulPaint.renderTime
      );
    }

    if (browsertimeRunData.timings.interactionToNextPaint) {
      statsHelpers.pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['timings', 'interactionToNextPaint'],
        browsertimeRunData.timings.interactionToNextPaint
      );
    }

    if (browsertimeRunData.pageinfo.cumulativeLayoutShift) {
      statsHelpers.pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['pageinfo', 'cumulativeLayoutShift'],
        browsertimeRunData.pageinfo.cumulativeLayoutShift
      );
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
      if (value) {
        statsHelpers.pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['navigationTiming', name],
          value
        );
      }
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

    forEach(browsertimeRunData.timings.paintTiming, (value, name) => {
      statsHelpers.pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['paintTiming', name],
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
      // Sometimes visual elements fails and gives us null values
      // And skip VisualProgress, ContentfulSpeedIndexProgress and others
      if (name.indexOf('Progress') === -1 && value !== null) {
        statsHelpers.pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['visualMetrics', name],
          value
        );
      }
    });

    if (browsertimeRunData.cpu) {
      if (browsertimeRunData.cpu.longTasks) {
        statsHelpers.pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['cpu', 'longTasks', 'tasks'],
          browsertimeRunData.cpu.longTasks.tasks
        );

        statsHelpers.pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['cpu', 'longTasks', 'totalDuration'],
          browsertimeRunData.cpu.longTasks.totalDuration
        );

        statsHelpers.pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['cpu', 'longTasks', 'totalBlockingTime'],
          browsertimeRunData.cpu.longTasks.totalBlockingTime
        );

        statsHelpers.pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['cpu', 'longTasks', 'maxPotentialFid'],
          browsertimeRunData.cpu.longTasks.maxPotentialFid
        );
      }
      if (browsertimeRunData.cpu.categories) {
        for (let categoryName of Object.keys(
          browsertimeRunData.cpu.categories
        )) {
          statsHelpers.pushGroupStats(
            this.statsPerType,
            this.groups[group],
            ['cpu', 'categories', categoryName],
            browsertimeRunData.cpu.categories[categoryName]
          );
        }
      }
    }
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
      } else if ('cpu'.indexOf(name) > -1) {
        const longTasks = {};
        const categories = {};
        summary.cpu = {};

        forEach(obj.cpu.longTasks, (stats, name) => {
          statsHelpers.setStatsSummary(longTasks, name, stats);
        });

        forEach(obj.cpu.categories, (stats, name) => {
          statsHelpers.setStatsSummary(categories, name, stats);
        });

        summary.cpu.longTasks = longTasks;
        summary.cpu.categories = categories;
      } else if ('memory'.indexOf(name) > -1) {
        const memory = {};
        statsHelpers.setStatsSummary(memory, 'memory', obj[name]);
        summary.memory = memory.memory;
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
