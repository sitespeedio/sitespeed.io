'use strict';

const aggregator = require('./aggregator');
const log = require('intel').getLogger('sitespeedio.plugin.gpsi');
const analyzer = require('./analyzer');
const path = require('path');
const DEFAULT_METRICS_PAGESUMMARY = ['ruleGroups.SPEED.score'];
const fs = require('fs');

module.exports = {
  open(context, options) {
    this.make = context.messageMaker('gpsi').make;
    this.options = {
      gpsi: options.gpsi,
      mobile: options.mobile
    };
    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_PAGESUMMARY,
      'gpsi.pageSummary'
    );

    this.pug = fs.readFileSync(
      path.resolve(__dirname, 'pug', 'index.pug'),
      'utf8'
    );
  },
  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'sitespeedio.setup': {
        queue.postMessage(
          make('html.pug', {
            name: 'gpsi',
            pug: this.pug,
            type: 'pageSummary'
          })
        );
        break;
      }

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
