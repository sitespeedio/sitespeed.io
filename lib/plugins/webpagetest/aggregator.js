'use strict';

const forEach = require('lodash.foreach');

const metrics = ['TTFB', 'render', 'fullyLoaded', 'SpeedIndex'];

class Aggregator {
  constructor(statsHelpers, log) {
    this.statsHelpers = statsHelpers;
    this.log = log;
    this.timingStats = {};
    this.assetStats = {};
    this.customStats = {};
    this.assetGroups = {};
    this.timingGroups = {};
    this.customGroups = {};
    this.connectivity;
    this.location;
  }

  addToAggregate(group, wptData, connectivity, location, wptOptions) {
    const log = this.log;
    const statsHelpers = this.statsHelpers;
    // TODO this will break if we run multiple locations/connectivity per run
    this.location = location;
    this.connectivity = connectivity;

    if (this.assetGroups[group] === undefined) {
      this.assetGroups[group] = {};
      this.timingGroups[group] = {};
      this.customGroups[group] = {};
    }

    forEach(wptData.data.runs, (run, index) => {
      // TODO remove this if check once issue with 0 stats, but 200 response is fixed upstream.
      // It seems to be cases when users tries to navigate away before fullyLoaded has happened
      const speedIndex = run.firstView.SpeedIndex || 0;
      if (wptOptions && wptOptions.video && speedIndex <= 0) {
        log.error(
          `Incomplete first view data for WPT test ${
            wptData.data.id
          }, run ${index}`
        );
        return false;
      }

      forEach(run, (viewData, viewName) => {
        forEach(metrics, metric =>
          statsHelpers.pushGroupStats(
            this.timingStats,
            this.timingGroups[group],
            [viewName, metric],
            viewData[metric]
          )
        );

        forEach(viewData.userTimes, (timingData, timingName) =>
          statsHelpers.pushGroupStats(
            this.timingStats,
            this.timingGroups[group],
            [viewName, timingName],
            timingData
          )
        );

        forEach(viewData.breakdown, (contentType, typeName) =>
          forEach(['requests', 'bytes'], property =>
            statsHelpers.pushGroupStats(
              this.assetStats,
              this.assetGroups[group],
              [viewName, typeName, property],
              contentType[property]
            )
          )
        );

        forEach(viewData.custom, metricName => {
          if (!isNaN(viewData[metricName])) {
            statsHelpers.pushGroupStats(
              this.customStats,
              this.customGroups[group],
              [viewName, 'custom', metricName],
              viewData[metricName]
            );
          }
        });
      });
    });
  }

  summarize() {
    const summary = {
      groups: {
        total: {
          timing: this.summarizePerTimingType(this.timingStats),
          asset: this.summarizePerAssetType(this.assetStats),
          custom: this.summarizePerCustomType(this.customStats)
        }
      }
    };

    for (let group of Object.keys(this.timingGroups)) {
      if (!summary.groups[group]) summary.groups[group] = {};
      summary.groups[group].timing = this.summarizePerTimingType(
        this.timingGroups[group]
      );
    }
    for (let group of Object.keys(this.assetGroups)) {
      if (!summary.groups[group]) summary.groups[group] = {};
      summary.groups[group].asset = this.summarizePerAssetType(
        this.assetGroups[group]
      );
    }
    if (this.customGroups) {
      for (let group of Object.keys(this.customGroups)) {
        if (!summary.groups[group]) summary.groups[group] = {};
        summary.groups[group].custom = this.summarizePerCustomType(
          this.customGroups[group]
        );
      }
    }
    return summary;
  }

  summarizePerAssetType(type) {
    const statsHelpers = this.statsHelpers;
    const summary = {};
    forEach(type, (view, viewName) =>
      forEach(view, (contentType, contentTypeName) =>
        forEach(contentType, (stats, propertyName) =>
          statsHelpers.setStatsSummary(
            summary,
            [viewName, 'breakdown', contentTypeName, propertyName],
            stats
          )
        )
      )
    );
    return summary;
  }

  summarizePerTimingType(type) {
    const statsHelpers = this.statsHelpers;
    const summary = {};
    forEach(type, (view, viewName) =>
      forEach(view, (stats, name) =>
        statsHelpers.setStatsSummary(summary, [viewName, name], stats)
      )
    );
    return summary;
  }

  summarizePerCustomType(type) {
    const statsHelpers = this.statsHelpers;
    const summary = {};
    forEach(type, (view, viewName) =>
      forEach(view, (metricName, name) =>
        forEach(metricName, (stats, propertyName) => {
          statsHelpers.setStatsSummary(
            summary,
            [viewName, name, propertyName],
            stats
          );
        })
      )
    );
    return summary;
  }
}

module.exports = Aggregator;
