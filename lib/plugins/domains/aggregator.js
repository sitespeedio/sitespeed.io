'use strict';

const Stats = require('fast-stats').Stats,
  urlParser = require('url'),
  statsHelpers = require('../../support/statsHelpers'),
  isNotEmpty = require('../../support/util').isNotEmpty,
  reduce = require('lodash.reduce');

const timingNames = ['blocked', 'dns', 'connect', 'ssl', 'send', 'wait', 'receive'];

const domains = {};

function parseDomainName(url) {
  return urlParser.parse(url).hostname;
}

function getDomainEntry(domainName) {
  let domain = domains[domainName];
  if (!domain) {
    domain = {
      domainName,
      requestCount: 0,
      totalTime: new Stats(),
      blocked: new Stats(),
      dns: new Stats(),
      connect: new Stats(),
      ssl: new Stats(),
      send: new Stats(),
      wait: new Stats(),
      receive: new Stats()
    };
    domains[domainName] = domain;
  }

  return domain;
}

module.exports = {
  addToAggregate(har) {
    har.log.entries.forEach((entry) => {
      const domainName = parseDomainName(entry.request.url),
        domain = getDomainEntry(domainName);

      domain.domainName = domainName;
      domain.requestCount++;
      domain.totalTime.push(entry.time);

      timingNames.forEach((name) => {
        const timing = entry.timings[name];

        if (timing && timing != -1) {
          domain[name].push(timing);
        }
      });
    });
  },
  summarize() {
    return reduce(domains, (summary, domainStats, domainName) => {
      const domainSummary = {
        domainName: domainStats.domainName,
        requestCount: domainStats.requestCount,
        totalTime: statsHelpers.summarizeStats(domainStats.totalTime)
      };

      timingNames.forEach((name) => {
        const stats = statsHelpers.summarizeStats(domainStats[name]);
        if (isNotEmpty(stats)) {
          domainSummary[name] = stats;
        }
      });

      summary[domainName] = domainSummary;
      return summary;
    }, {});
  }
};
