'use strict';

const Stats = require('fast-stats').Stats,
  statsHelpers = require('../../support/statsHelpers');

function scoreAggregatorForRuleGroup(ruleGroup) {
  return {
    stats: new Stats(),
    addToAggregate(gpsiData) {
      this.stats.push(gpsiData.ruleGroups[ruleGroup].score);
    },
    summarize() {
      return statsHelpers.summarizeStats(this.stats);
    }
  }
}

const pageStatsAggregator = {
  stats: new Stats(),
  addToAggregate(gpsiData) {
    this.stats.push(gpsiData.pageStats.numberResources);
  },
  summarize() {
    return statsHelpers.summarizeStats(this.stats);
  }
};


module.exports = {
  speedAggregator: scoreAggregatorForRuleGroup('SPEED'),
  pageStatsAggregator: pageStatsAggregator
};
