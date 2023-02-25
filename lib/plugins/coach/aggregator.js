import forEach from 'lodash.foreach';
import { pushGroupStats, setStatsSummary } from '../../support/statsHelpers.js';

export class CoachAggregator {
  constructor() {
    this.statsPerCategory = {};
    this.groups = {};
  }

  addToAggregate(coachData, group) {
    if (this.groups[group] === undefined) {
      this.groups[group] = {};
    }

    // push the total score
    pushGroupStats(
      this.statsPerCategory,
      this.groups[group],
      'score',
      coachData.advice.score
    );

    forEach(coachData.advice, (category, categoryName) => {
      if (category.score === undefined) {
        return;
      }
      // Push the score per category
      pushGroupStats(
        this.statsPerCategory,
        this.groups[group],
        [categoryName, 'score'],
        category.score
      );

      forEach(category.adviceList, (advice, adviceName) => {
        pushGroupStats(
          this.statsPerCategory,
          this.groups[group],
          [categoryName, adviceName],
          advice.score
        );
      });
    });
  }
  summarize() {
    if (Object.keys(this.statsPerCategory).length === 0) {
      return;
    }

    const summary = {
      groups: {
        total: this.summarizePerObject(this.statsPerCategory)
      }
    };

    for (let group of Object.keys(this.groups)) {
      summary.groups[group] = this.summarizePerObject(this.groups[group]);
    }
    return summary;
  }
  summarizePerObject(type) {
    return Object.keys(type).reduce((summary, categoryName) => {
      if (categoryName === 'score') {
        setStatsSummary(summary, 'score', type[categoryName]);
      } else {
        const categoryData = {};

        forEach(type[categoryName], (stats, name) => {
          setStatsSummary(categoryData, name, stats);
        });

        summary[categoryName] = categoryData;
      }

      return summary;
    }, {});
  }
}
