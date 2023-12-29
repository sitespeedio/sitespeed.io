import forEach from 'lodash.foreach';
import { pushGroupStats, setStatsSummary } from '../../support/statsHelpers.js';

const timings = ['firstPaint', 'timeToDomContentFlushed'];

export class BrowsertimeAggregator {
  constructor() {
    this.statsPerType = {};
    this.groups = {};
  }

  addToAggregate(browsertimeRunData, group) {
    if (this.groups[group] === undefined) {
      this.groups[group] = {};
    }

    if (browsertimeRunData.fullyLoaded) {
      pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['timings', 'fullyLoaded'],
        browsertimeRunData.fullyLoaded
      );
    }

    if (browsertimeRunData.memory) {
      pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['memory'],
        browsertimeRunData.memory
      );
    }

    if (browsertimeRunData.googleWebVitals) {
      for (let metric of Object.keys(browsertimeRunData.googleWebVitals)) {
        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['googleWebVitals', metric],
          browsertimeRunData.googleWebVitals[metric]
        );
      }
    }

    if (browsertimeRunData.timings) {
      if (browsertimeRunData.timings.largestContentfulPaint) {
        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['timings', 'largestContentfulPaint'],
          browsertimeRunData.timings.largestContentfulPaint.renderTime
        );
      }

      if (browsertimeRunData.timings.interactionToNextPaint) {
        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['timings', 'interactionToNextPaint'],
          browsertimeRunData.timings.interactionToNextPaint
        );
      }

      forEach(timings, timing => {
        if (browsertimeRunData.timings[timing]) {
          pushGroupStats(
            this.statsPerType,
            this.groups[group],
            timing,
            browsertimeRunData.timings[timing]
          );
        }
      });

      forEach(browsertimeRunData.timings.navigationTiming, (value, name) => {
        if (value) {
          pushGroupStats(
            this.statsPerType,
            this.groups[group],
            ['navigationTiming', name],
            value
          );
        }
      });

      forEach(browsertimeRunData.timings.pageTimings, (value, name) => {
        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['pageTimings', name],
          value
        );
      });

      forEach(browsertimeRunData.timings.paintTiming, (value, name) => {
        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['paintTiming', name],
          value
        );
      });

      forEach(browsertimeRunData.timings.userTimings.marks, timing => {
        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['userTimings', 'marks', timing.name],
          timing.startTime
        );
      });

      forEach(browsertimeRunData.timings.userTimings.measures, timing => {
        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['userTimings', 'measures', timing.name],
          timing.duration
        );
      });
    }

    if (
      browsertimeRunData.pageinfo &&
      browsertimeRunData.pageinfo.cumulativeLayoutShift
    ) {
      pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['pageinfo', 'cumulativeLayoutShift'],
        browsertimeRunData.pageinfo.cumulativeLayoutShift
      );
    }

    // pick up one level of custom metrics
    forEach(browsertimeRunData.custom, (value, name) => {
      pushGroupStats(
        this.statsPerType,
        this.groups[group],
        ['custom', name],
        value
      );
    });

    forEach(browsertimeRunData.visualMetrics, (value, name) => {
      // Sometimes visual elements fails and gives us null values
      // And skip VisualProgress, ContentfulSpeedIndexProgress and others
      if (!name.includes('Progress') && value !== null) {
        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['visualMetrics', name],
          value
        );
      }
    });

    if (browsertimeRunData.cpu) {
      if (browsertimeRunData.cpu.longTasks) {
        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['cpu', 'longTasks', 'tasks'],
          browsertimeRunData.cpu.longTasks.tasks
        );

        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['cpu', 'longTasks', 'totalDuration'],
          browsertimeRunData.cpu.longTasks.totalDuration
        );

        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['cpu', 'longTasks', 'totalBlockingTime'],
          browsertimeRunData.cpu.longTasks.totalBlockingTime
        );

        pushGroupStats(
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
          pushGroupStats(
            this.statsPerType,
            this.groups[group],
            ['cpu', 'categories', categoryName],
            browsertimeRunData.cpu.categories[categoryName]
          );
        }
      }
    }
  }

  summarize() {
    if (Object.keys(this.statsPerType).length === 0) {
      return;
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
  }

  summarizePerObject(object) {
    return Object.keys(object).reduce((summary, name) => {
      if (timings.includes(name)) {
        setStatsSummary(summary, name, object[name]);
      } else if ('userTimings'.includes(name)) {
        summary.userTimings = {};
        const marksData = {},
          measuresData = {};
        forEach(object.userTimings.marks, (stats, timingName) => {
          setStatsSummary(marksData, timingName, stats);
        });
        forEach(object.userTimings.measures, (stats, timingName) => {
          setStatsSummary(measuresData, timingName, stats);
        });
        summary.userTimings.marks = marksData;
        summary.userTimings.measures = measuresData;
      } else if ('cpu'.includes(name)) {
        const longTasks = {};
        const categories = {};
        summary.cpu = {};

        forEach(object.cpu.longTasks, (stats, name) => {
          setStatsSummary(longTasks, name, stats);
        });

        forEach(object.cpu.categories, (stats, name) => {
          setStatsSummary(categories, name, stats);
        });

        summary.cpu.longTasks = longTasks;
        summary.cpu.categories = categories;
      } else if ('memory'.includes(name)) {
        const memory = {};
        setStatsSummary(memory, 'memory', object[name]);
        summary.memory = memory.memory;
      } else {
        const categoryData = {};
        forEach(object[name], (stats, timingName) => {
          setStatsSummary(categoryData, timingName, stats);
        });
        summary[name] = categoryData;
      }
      return summary;
    }, {});
  }
}
