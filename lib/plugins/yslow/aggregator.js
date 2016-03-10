'use strict';

const Stats = require('fast-stats').Stats,
  statsHelpers = require('../../support/statsHelpers');

module.exports = {
  stats: {
    score: new Stats()
  },
  addToAggregate(yslowData) {
    this.stats.score.push(yslowData.o);
  },
  summarize() {
    return {
      score: statsHelpers.summarizeStats(this.stats.score)
    };
  }
};
