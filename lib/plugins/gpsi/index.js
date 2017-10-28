'use strict';

const messageMaker = require('../../support/messageMaker');
const aggregator = require('./aggregator');
const log = require('intel').getLogger('sitespeedio.plugin.gpsi');
const filterRegistry = require('../../support/filterRegistry');
const analyzer = require('./analyzer');

const make = messageMaker('gpsi').make;
const DEFAULT_METRICS_PAGESUMMARY = ['ruleGroups.SPEED.score'];

module.exports = {
  open(context, options) {
    this.options = {
      gpsi: options.gpsi,
      mobile: options.mobile
    };
    filterRegistry.registerFilterForType(
      DEFAULT_METRICS_PAGESUMMARY,
      'gpsi.pageSummary'
    );
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'url': {
        const url = message.url;
        const group = message.group;
        return analyzer.analyzeUrl(url, this.options).then(result => {
          log.info('Got ' + url + ' analysed from Google Page Speed Insights');
          log.verbose('Result from Google Page Speed Insights:%:2j', result);
          queue.postMessage(
            make('gpsi.pageSummary', result, {
              url,
              group
            })
          );
          aggregator.addToAggregate(result, group);
        });
      }

      case 'sitespeedio.summarize': {
        const summary = aggregator.summarize();
        if (summary) {
          queue.postMessage(
            make('gpsi.summary', summary.groups.total, { group: 'total' })
          );
        }
      }
    }
  }
};
