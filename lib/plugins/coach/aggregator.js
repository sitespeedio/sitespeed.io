'use strict';

const forEach = require('lodash.foreach'),
  getGroup = require('../../support/util').getGroup,
  statsHelpers = require('../../support/statsHelpers');

module.exports = {
  statsPerCategory: {},
  groups: {},

  addToAggregate(coachData, url) {

    const group = getGroup(url);

    if (this.groups[group] === undefined) {
      this.groups[group] = {};
    }

    // push the total score
    statsHelpers.pushGroupStats(this.statsPerCategory, this.groups[group], 'score', coachData.advice.score);

    forEach(coachData.advice, (category, categoryName) => {
      if (category.score === undefined) {
        return;
      }
      // Push the score per category
      statsHelpers.pushGroupStats(this.statsPerCategory, this.groups[group], [categoryName, 'score'], category.score);

      forEach(category.adviceList, (advice, adviceName) => {
        statsHelpers.pushGroupStats(this.statsPerCategory, this.groups[group], [categoryName, adviceName], advice.score);
      });
    });
  },
  summarize() {
    const summary = {
      groups: {
        total: this.summarizePerObject(this.statsPerCategory)
      }
    };

    for (let group of Object.keys(this.groups)) {
      summary.groups[group] = this.summarizePerObject(this.groups[group]);
    }
    return summary;
  },
  summarizePerObject(type) {
    return Object.keys(type).reduce((summary, categoryName) => {
      if (categoryName === 'score') {
        statsHelpers.setStatsSummary(summary, 'score', type[categoryName])
      } else {
        const categoryData = {};

        forEach(type[categoryName], (stats, name) => {
          statsHelpers.setStatsSummary(categoryData, name, stats)
        });

        summary[categoryName] = categoryData;
      }

      return summary;
    }, {});
  }
};
