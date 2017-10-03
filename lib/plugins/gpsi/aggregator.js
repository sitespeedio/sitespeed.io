'use strict';

const statsHelpers = require('../../support/statsHelpers');

module.exports = {
  statsPerType: {},
  total: {},
  groups: {},
  addToAggregate(gpsiData, group) {
    if (this.groups[group] === undefined) {
      this.groups[group] = {};
    }
    statsHelpers.pushGroupStats(
      this.statsPerType,
      this.groups[group],
      'SPEED.score',
      gpsiData.ruleGroups['SPEED'].score
    );
    statsHelpers.pushStats(
      this.total,
      'SPEED.score',
      gpsiData.ruleGroups['SPEED'].score
    );
  },
  summarize() {
    if (!this.total.SPEED) return undefined;

    const summary = {};
    statsHelpers.setStatsSummary(
      summary,
      'groups.total.SPEED.score',
      this.total.SPEED.score
    );
    // TODO add GPSI score per group
    return summary;
  }
};
