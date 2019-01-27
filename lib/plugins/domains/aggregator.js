'use strict';

const Stats = require('fast-stats').Stats,
  urlParser = require('url'),
  log = require('intel').getLogger('sitespeedio.plugin.domains'),
  statsHelpers = require('../../support/statsHelpers'),
  isEmpty = require('lodash.isempty'),
  reduce = require('lodash.reduce');

const timingNames = [
  'blocked',
  'dns',
  'connect',
  'ssl',
  'send',
  'wait',
  'receive'
];

function parseDomainName(url) {
  return urlParser.parse(url).hostname;
}

function getDomain(domainName) {
  return {
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
}

function calc(domains) {
  return reduce(
    domains,
    (summary, domainStats, domainName) => {
      const domainSummary = {
        requestCount: domainStats.requestCount,
        domainName
      };

      const stats = statsHelpers.summarizeStats(domainStats.totalTime);
      if (!isEmpty(stats)) {
        domainSummary.totalTime = stats;
      }
      timingNames.forEach(name => {
        const stats = statsHelpers.summarizeStats(domainStats[name]);
        if (!isEmpty(stats)) {
          domainSummary[name] = stats;
        }
      });

      summary[domainName] = domainSummary;
      return summary;
    },
    {}
  );
}

function isValidTiming(timing) {
  // The HAR format uses -1 to indicate invalid/missing timings
  // isNan see https://github.com/sitespeedio/sitespeed.io/issues/2159
  return typeof timing === 'number' && timing !== -1 && !isNaN(timing);
}

module.exports = {
  groups: {},
  domains: {},
  addToAggregate(har, url) {
    const mainDomain = parseDomainName(url);
    if (this.groups[mainDomain] === undefined) {
      this.groups[mainDomain] = {};
    }
    const firstPageId = har.log.pages[0].id;

    har.log.entries.forEach(entry => {
      if (entry.pageref !== firstPageId) {
        // Only pick the first request out of multiple runs.
        return;
      }

      const domainName = parseDomainName(entry.request.url),
        domain = this.domains[domainName] || getDomain(domainName),
        groupDomain =
          this.groups[mainDomain][domainName] || getDomain(domainName),
        totalTime = entry.time;

      domain.requestCount++;
      groupDomain.requestCount++;

      if (isValidTiming(totalTime)) {
        domain.totalTime.push(totalTime);
        groupDomain.totalTime.push(totalTime);
      } else {
        log.debug('Missing time from har entry for url: ' + entry.request.url);
      }

      timingNames.forEach(name => {
        const timing = entry.timings[name];

        if (isValidTiming(timing)) {
          domain[name].push(timing);
          groupDomain[name].push(timing);
        }
      });
      this.domains[domainName] = domain;
      this.groups[mainDomain][domainName] = groupDomain;
    });
  },
  summarize() {
    const summary = {
      groups: {
        total: calc(this.domains)
      }
    };

    for (let group of Object.keys(this.groups)) {
      summary.groups[group] = calc(this.groups[group]);
    }

    return summary;
  }
};
