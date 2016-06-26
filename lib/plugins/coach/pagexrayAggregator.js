'use strict';

const statsHelpers = require('../../support/statsHelpers'),
  forEach = require('lodash.foreach');

const METRIC_NAMES = ['transferSize', 'contentSize', 'requests'];

module.exports = {
  stats: {},
  addToAggregate(pageSummary) {
    let stats = this.stats;
    pageSummary.forEach(function(summary) {
      // stats for the whole page
      METRIC_NAMES.forEach(function(metric) {
        statsHelpers.pushStats(stats, metric, summary[metric]);
      });

      Object.keys(summary.contentTypes).forEach(function(contentType) {
        METRIC_NAMES.forEach(function(metric) {
          statsHelpers.pushStats(stats, 'contentTypes.' + contentType + '.' + metric, summary.contentTypes[contentType][metric]);
        });
      })

      Object.keys(summary.responseCodes).forEach(function(responseCode) {
        statsHelpers.pushStats(stats, 'responseCodes.' + responseCode, summary.responseCodes[responseCode]);
      });

      // extras for firstParty vs third
      if (summary.firstParty.requests) {
        METRIC_NAMES.forEach(function(metric) {
          statsHelpers.pushStats(stats, 'firstParty' + '.' + metric, summary.firstParty[metric]);
          statsHelpers.pushStats(stats, 'thirdParty' + '.' + metric, summary.thirdParty[metric]);
        })
      }

      // Add the total amount of domains on this page
      statsHelpers.pushStats(stats, 'domains', (Object.keys(summary.domains)).length);

      forEach(summary.assets, (asset) => {
        statsHelpers.pushStats(stats, 'expireStats', asset.expires);
        statsHelpers.pushStats(stats, 'lastModifiedStats', asset.timeSinceLastModified);
      });

    })

  },
  summarize() {
    return Object.keys(this.stats).reduce((summary, name) => {
      if (METRIC_NAMES.indexOf(name) > -1 || name.match(/(^domains|^expireStats|^lastModifiedStats)/)) {
        statsHelpers.setStatsSummary(summary, name, this.stats[name])
      } else {
        if (name === 'contentTypes') {
          const contentTypeData = {};
          forEach(Object.keys(this.stats[name]), (contentType) => {
            forEach(this.stats[name][contentType], (stats, metric) => {
              statsHelpers.setStatsSummary(contentTypeData, [contentType, metric], stats)
            });
          });
          summary[name] = contentTypeData;
        } else if(name === 'responseCodes') {
          const responseCodeData = {};
          this.stats.responseCodes.forEach((stats, metric) =>{
            statsHelpers.setStatsSummary(responseCodeData, metric, stats);
          });
          summary[name] = responseCodeData;
        } else {
          const data = {};
          forEach(this.stats[name], (stats, metric) => {
            statsHelpers.setStatsSummary(data, metric, stats)
          });
          summary[name] = data;
        }
      }
      return summary;
    }, {});
  }
};
