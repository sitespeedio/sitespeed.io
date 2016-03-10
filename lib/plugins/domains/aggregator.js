'use strict';

/* eslint no-console:0 */

const Stats = require('fast-stats').Stats,
  urlParser = require('url'),
  statsHelpers = require('../../support/statsHelpers');

function parseDomain(url) {
  return urlParser.parse(url).hostname;
}

const timingNames = ['blocked', 'dns', 'connect', 'ssl', 'send', 'wait', 'receive'];

module.exports = {
  domains: {},
  addToAggregate(har) {
    this.domains = har.log.entries.reduce((domainStats, entry) => {
      const domain = parseDomain(entry.request.url);
      const domainEntry = domainStats[domain] || {};

      timingNames.forEach((name) => {
        const timing = entry.timings[name];

        if (timing && timing != -1) {
          const stats = domainEntry[name] || new Stats();

          stats.push(timing);

          domainEntry[name] = stats;
        }
      });

      domainStats[domain] = domainEntry;
      return domainStats;
    }, this.domains);
  },
  summarize() {
    const domainNames = Object.keys(this.domains);

    return domainNames.reduce((result, domain) => {
      const domainEntries = this.domains[domain];
      result[domain] = Object.keys(domainEntries).reduce((result, name) => {
        try {
          result[name] = statsHelpers.summarizeStats(domainEntries[name]);
        } catch (e) {
          throw new Error('Failed to summarize ' + name, e);
        }
        return result;
      }, {});
      return result;
    }, {});
  }
};
