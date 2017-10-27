'use strict';

const statsHelpers = require('../../support/statsHelpers');
const METRIC_NAMES = [
  'critical-request-chains',
  'first-meaningful-paint',
  'speed-index-metric',
  'estimated-input-latency',
  'first-interactive',
  'consistently-interactive'
];

function replaceAll(str, search, replacement) {
  return str.replace(new RegExp(search, 'g'), replacement);
}

module.exports = {
  stats: {},
  groups: {},
  addToAggregate(data, group) {
    if (this.groups[group] === undefined) {
      this.groups[group] = {};
    }
    let stats = this.stats;
    let groups = this.groups;

    METRIC_NAMES.forEach(function(metric) {
      if (metric == 'critical-request-chains') {
        statsHelpers.pushGroupStats(
          stats,
          groups[group],
          metric,
          parseInt(data[metric].displayValue)
        );
      } else {
        statsHelpers.pushGroupStats(
          stats,
          groups[group],
          metric,
          parseInt(data[metric].rawValue)
        );
      }
    });
  },
  summarize() {
    if (
      Object.keys(this.stats).length === 0 ||
      Object.keys(this.groups).length === 0
    )
      return undefined;

    const summary = {
      groups: {}
    };
    const tmp = {};
    for (let group of Object.keys(this.groups)) {
      for (let stat of Object.keys(this.stats)) {
        statsHelpers.setStatsSummary(
          tmp,
          replaceAll(stat, '-', ''),
          this.stats[stat]
        );
      }
      summary.groups[group] = tmp;
    }

    return summary;
  }
};
