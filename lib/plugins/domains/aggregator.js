'use strict';

const Stats = require('fast-stats').Stats,
  urlParser = require('url'),
  log = require('intel'),
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

function isValidTiming(timing) {
  // The HAR format uses -1 to indicate invalid/missing timings
  return (typeof timing === 'number' && timing !== -1);
}

module.exports = {
  addToAggregate(har) {
    const firstPageId = har.log.pages[0].id;

    har.log.entries.forEach((entry) => {
      if (entry.pageref !== firstPageId) {
        // Only pick the first request out of multiple runs.
        return;
      }

      const domainName = parseDomainName(entry.request.url),
        domain = getDomainEntry(domainName),
        totalTime = entry.time;

      domain.domainName = domainName;
      domain.requestCount++;
      if (isValidTiming(totalTime)) {
        domain.totalTime.push(totalTime);
      } else {
        log.debug('Missing time from har entry for url: ' + entry.request.url);
      }

      timingNames.forEach((name) => {
        const timing = entry.timings[name];

        if (isValidTiming(timing)) {
          domain[name].push(timing);
        }
      });
    });
  },
  summarize() {
    return reduce(domains, (summary, domainStats, domainName) => {
      const domainSummary = {
        domainName: domainStats.domainName,
        requestCount: domainStats.requestCount
      };

      const stats = statsHelpers.summarizeStats(domainStats.totalTime);
      if (isNotEmpty(stats)) {
        domainSummary.totalTime = stats;
      }
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
