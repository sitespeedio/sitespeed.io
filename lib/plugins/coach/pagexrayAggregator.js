'use strict';

const statsHelpers = require('../../support/statsHelpers'),
forEach = require('lodash.foreach');

const METRIC_NAMES = ['transferSize', 'contentSize', 'requests'];
const CONTENT_TYPES = ['html', 'javascript', 'css', 'image', 'font'];

module.exports = {
  stats: {},
  addToAggregate(pageSummary) {
    let stats = this.stats;
    pageSummary.forEach(function(summary) {
      // stats for the whole page
      METRIC_NAMES.forEach(function(metric) {
        statsHelpers.pushStats(stats, metric, summary[metric]);
      })

      // stats for each content type
      CONTENT_TYPES.forEach(function(contentType) {
        if (summary.contentTypes[contentType]) {
          METRIC_NAMES.forEach(function(metric) {
            statsHelpers.pushStats(stats, contentType + '.' + metric, summary.contentTypes[contentType][metric]);
          });
        }
      });
    })

  },
  summarize() {
    return Object.keys(this.stats).reduce((summary, name) => {
      if (METRIC_NAMES.indexOf(name) > -1) {
        statsHelpers.setStatsSummary(summary, name, this.stats[name])
      } else {
        const data = {};
        forEach(this.stats[name], (stats, metric) => {
          statsHelpers.setStatsSummary(data, metric, stats)
        });
        summary[name] = data;
      }
      return summary;
    }, {});
  }
};
