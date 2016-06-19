'use strict';

const forEach = require('lodash.foreach'),
  statsHelpers = require('../../support/statsHelpers');

const metrics = ['TTFB', 'render', 'fullyLoaded', 'SpeedIndex'];

module.exports = {
  timingStats: {},
  assetStats: {},
  connectivity: undefined,
  location: undefined,
  addToAggregate(wptData, connectivity, location) {
    // TODO this will break if we run multiple locations/connectivity per run
    this.location = location;
    this.connectivity = connectivity;

    forEach(wptData.data.runs, (run) => {
      forEach(run, (viewData, viewName) => {

        forEach(metrics, (metric) =>
          statsHelpers.pushStats(this.timingStats, [viewName, metric], viewData[metric]));

        forEach(viewData.userTimes, (timingData, timingName) =>
          statsHelpers.pushStats(this.timingStats, [viewName, timingName], timingData));

        forEach(viewData.breakdown, (contentType, typeName) =>
          forEach(['requests', 'bytes'], (property) =>
            statsHelpers.pushStats(this.assetStats, [viewName, typeName, property], contentType[property])));

        // TODO get all custom metrics
      });
    });
  },
  summarize() {
    const summary = {};

    forEach(this.timingStats, (view, viewName) =>
      forEach(view, (stats, name) =>
        statsHelpers.setStatsSummary(summary, [viewName, name], stats)));

    forEach(this.assetStats, (view, viewName) =>
      forEach(view, (contentType, contentTypeName) =>
        forEach(contentType, (stats, propertyName) =>
          statsHelpers.setStatsSummary(summary, [viewName, contentTypeName, propertyName], stats))));

    return summary;
  }
};
