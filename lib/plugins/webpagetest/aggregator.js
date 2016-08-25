'use strict';

const forEach = require('lodash.foreach'),
  statsHelpers = require('../../support/statsHelpers');

const metrics = ['TTFB', 'render', 'fullyLoaded', 'SpeedIndex'];

module.exports = {
  timingStats: {},
  assetStats: {},
  assetGroups: {},
  timingGroups: {},
  connectivity: undefined,
  location: undefined,
  addToAggregate(group, wptData, connectivity, location) {
    // TODO this will break if we run multiple locations/connectivity per run
    this.location = location;
    this.connectivity = connectivity;

    if (this.assetGroups[group] === undefined) {
      this.assetGroups[group] = {};
      this.timingGroups[group] = {};
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

        // TODO get all custom metrics
      });
    });
  },
  summarize() {
    const summary = {
      groups: {
        total: {
          timing: this.summarizePerTimingType(this.timingStats),
          asset: this.summarizePerAssetType(this.assetStats)
        }
      }
    };

    for (let group of Object.keys(this.assetGroups)) {
      if (!summary.groups[group]) summary.groups[group] = {};

      summary.groups[group].timing = this.summarizePerTimingType(this.timingGroups[group]);

      summary.groups[group].asset = this.summarizePerAssetType(this.assetGroups[group]);
    }
    return summary;
  },
  summarizePerAssetType(type) {
    const summary = {};
    forEach(type, (view, viewName) =>
      forEach(view, (contentType, contentTypeName) =>
        forEach(contentType, (stats, propertyName) =>
          statsHelpers.setStatsSummary(summary, [viewName, contentTypeName, propertyName], stats))));
    return summary;
  },
  summarizePerTimingType(type) {
    const summary = {};
    forEach(type, (view, viewName) =>
      forEach(view, (stats, name) =>
        statsHelpers.setStatsSummary(summary, [viewName, name], stats)));
    return summary;
  }
};
