'use strict';

const forEach = require('lodash.foreach'),
  statsHelpers = require('../../support/statsHelpers');

module.exports = {
  statsPerCategory: {},

  addToAggregate(coachData) {
    forEach(coachData.results, (category, categoryName) => {
      if (category.score === undefined) {
        return;
      }

      statsHelpers.pushStats(this.statsPerCategory, 'score', category.score);

      forEach(category.adviceList, (advice, adviceName) => {
        statsHelpers.pushStats(this.statsPerCategory, [categoryName, adviceName], advice.score);
      });
    });
  },
  summarize() {
    return Object.keys(this.statsPerCategory).reduce((summary, categoryName) => {
      if (categoryName === 'score') {
        statsHelpers.setStatsSummary(summary, 'score', this.statsPerCategory[categoryName])
      } else {
        const categoryData = {};

        forEach(this.statsPerCategory[categoryName], (stats, name) => {
          statsHelpers.setStatsSummary(categoryData, name, stats)
        });

        summary[categoryName] = categoryData;
      }

      return summary;
    }, {});
  }
};
