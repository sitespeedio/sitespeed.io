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

      for (const timing of timings) {
        if (browsertimeRunData.timings[timing]) {
          pushGroupStats(
            this.statsPerType,
            this.groups[group],
            timing,
            browsertimeRunData.timings[timing]
          );
        }
      }

      for (const [name, value] of Object.entries(
        browsertimeRunData.timings.navigationTiming
      )) {
        if (value) {
          pushGroupStats(
            this.statsPerType,
            this.groups[group],
            ['navigationTiming', name],
            value
          );
        }
      }

      for (const [name, value] of Object.entries(
        browsertimeRunData.timings.pageTimings
      )) {
        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['pageTimings', name],
          value
        );
      }

      for (const [name, value] of Object.entries(
        browsertimeRunData.timings.paintTiming
      )) {
        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['paintTiming', name],
          value
        );
      }

      for (const timing of browsertimeRunData.timings.userTimings.marks) {
        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['userTimings', 'marks', timing.name],
          timing.startTime
        );
      }

      for (const timing of browsertimeRunData.timings.userTimings.measures) {
        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['userTimings', 'measures', timing.name],
          timing.duration
        );
      }
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
    if (browsertimeRunData.custom) {
      for (const [name, value] of Object.entries(browsertimeRunData.custom)) {
        pushGroupStats(
          this.statsPerType,
          this.groups[group],
          ['custom', name],
          value
        );
      }
    }

    if (browsertimeRunData.visualMetrics) {
      for (const [name, value] of Object.entries(
        browsertimeRunData.visualMetrics
      )) {
        if (!name.includes('Progress') && value !== null) {
          pushGroupStats(
            this.statsPerType,
            this.groups[group],
            ['visualMetrics', name],
            value
          );
        }
      }
    }
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
        if (object.userTimings.marks) {
          for (const [timingName, stats] of Object.entries(
            object.userTimings.marks
          )) {
            setStatsSummary(marksData, timingName, stats);
          }
        }

        if (object.userTimings.measures) {
          for (const [timingName, stats] of Object.entries(
            object.userTimings.measures
          )) {
            setStatsSummary(measuresData, timingName, stats);
          }
        }

        summary.userTimings.marks = marksData;
        summary.userTimings.measures = measuresData;
      } else if ('cpu'.includes(name)) {
        const longTasks = {};
        const categories = {};
        summary.cpu = {};

        if (object.cpu.longTasks) {
          for (const [name, stats] of Object.entries(object.cpu.longTasks)) {
            setStatsSummary(longTasks, name, stats);
          }
        }

        if (object.cpu.categories) {
          for (const [name, stats] of Object.entries(object.cpu.categories)) {
            setStatsSummary(categories, name, stats);
          }
        }

        summary.cpu.longTasks = longTasks;
        summary.cpu.categories = categories;
      } else if ('memory'.includes(name)) {
        const memory = {};
        setStatsSummary(memory, 'memory', object[name]);
        summary.memory = memory.memory;
      } else {
        const categoryData = {};
        for (const [timingName, stats] of Object.entries(object[name])) {
          setStatsSummary(categoryData, timingName, stats);
        }
        summary[name] = categoryData;
      }
      return summary;
    }, {});
  }
}
