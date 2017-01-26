'use strict';

const forEach = require('lodash.foreach'),
  statsHelpers = require('../../support/statsHelpers');

const metrics = ['TTFB', 'render', 'fullyLoaded', 'SpeedIndex'];

module.exports = {
  timingStats: {},
  assetStats: {},
  customStats: {},
  assetGroups: {},
  timingGroups: {},
  customGroups: {},
  connectivity: undefined,
  location: undefined,
  addToAggregate(group, wptData, connectivity, location) {
    // TODO this will break if we run multiple locations/connectivity per run
    this.location = location;
    this.connectivity = connectivity;

    if (this.assetGroups[group] === undefined) {
      this.assetGroups[group] = {};
      this.timingGroups[group] = {};
      this.customGroups[group] = {};
    }

    forEach(wptData.data.runs, (run) => {
      forEach(run, (viewData, viewName) => {
        forEach(metrics, (metric) =>
          statsHelpers.pushGroupStats(this.timingStats, this.timingGroups[group], [viewName, metric], viewData[metric]));

        forEach(viewData.userTimes, (timingData, timingName) =>
          statsHelpers.pushGroupStats(this.timingStats, this.timingGroups[group], [viewName, timingName], timingData));

        forEach(viewData.breakdown, (contentType, typeName) =>
          forEach(['requests', 'bytes'], (property) =>
            statsHelpers.pushGroupStats(this.assetStats, this.assetGroups[group], [viewName, typeName, property], contentType[property])));

        forEach(viewData.custom, (metricName) => {
          if (!isNaN(viewData[metricName])) {
         statsHelpers.pushGroupStats(
              this.customStats,
              this.customGroups[group],
              [viewName, 'custom', metricName],
              viewData[metricName])
            }
          });
      });
    });
  },
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
      summary.groups[group].timing = this.summarizePerTimingType(this.timingGroups[group]);
    }
    for (let group of Object.keys(this.assetGroups)) {
      if (!summary.groups[group]) summary.groups[group] = {};
      summary.groups[group].asset = this.summarizePerAssetType(this.assetGroups[group]);
    }
    if (this.customGroups) {
      for (let group of Object.keys(this.customGroups)) {
        if (!summary.groups[group]) summary.groups[group] = {};
        summary.groups[group].custom = this.summarizePerCustomType(this.customGroups[group]);
      }
    }
    return summary;
  },
  summarizePerAssetType(type) {
    const summary = {};
    forEach(type, (view, viewName) =>
      forEach(view, (contentType, contentTypeName) =>
        forEach(contentType, (stats, propertyName) =>
          statsHelpers.setStatsSummary(summary, [viewName, 'breakdown', contentTypeName, propertyName], stats))));
    return summary;
  },
  summarizePerTimingType(type) {
    const summary = {};
    forEach(type, (view, viewName) =>
      forEach(view, (stats, name) =>
        statsHelpers.setStatsSummary(summary, [viewName, name], stats)));
    return summary;
  },
  summarizePerCustomType(type) {
    const summary = {};
    forEach(type, (view, viewName) =>
      forEach(view, (metricName, name) =>
          forEach(metricName, (stats, propertyName) => {
          statsHelpers.setStatsSummary(summary, [viewName, name, propertyName], stats)
        }
        )));
    return summary;
  }
};
