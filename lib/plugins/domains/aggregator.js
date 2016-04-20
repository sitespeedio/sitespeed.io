'use strict';

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

      let total = 0;
      timingNames.forEach((name) => {
        const timing = entry.timings[name];

        if (timing && timing != -1) {
          const stats = domainEntry[name] || new Stats();
          stats.push(timing);
          domainEntry[name] = stats;
          total += timing;
        }
       });

      // add total stats
      domainEntry.total  = domainEntry.total || new Stats();
      domainEntry.total.push(total);

      domainEntry.requests = domainEntry.requests + 1 || 1;
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
          if (name !== 'requests') {
          result[name] = statsHelpers.summarizeStats(domainEntries[name]);
          }
          else {
            result[name] = domainEntries[name];
          }
        } catch (e) {
          throw new Error('Failed to summarize ' + name, e);
        }
        return result;
      }, {});
      return result;
    }, {});
  }
};
