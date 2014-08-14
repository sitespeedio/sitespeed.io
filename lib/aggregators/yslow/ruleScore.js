var Aggregator = require('../../aggregator');

module.exports = new Aggregator('ruleScore', 'Rule Score',
    'The sitespeed.io total rule score for all the pages',
    '', 0,
    function (pageData) {
      if (pageData.yslow) {
        this.stats.push(pageData.yslow.o);
      }
    });
