import { parse } from 'node:url';

import { Stats } from 'fast-stats';
import intel from 'intel';
import isEmpty from 'lodash.isempty';
import reduce from 'lodash.reduce';

import { summarizeStats } from '../../support/statsHelpers.js';

const log = intel.getLogger('sitespeedio.plugin.domains');

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
  return parse(url).hostname;
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

      const stats = summarizeStats(domainStats.totalTime);
      if (!isEmpty(stats)) {
        domainSummary.totalTime = stats;
      }
      for (const name of timingNames) {
        const stats = summarizeStats(domainStats[name]);
        if (!isEmpty(stats)) {
          domainSummary[name] = stats;
        }
      }

      summary[domainName] = domainSummary;
      return summary;
    },
    {}
  );
}

function isValidTiming(timing) {
  // The HAR format uses -1 to indicate invalid/missing timings
  // isNan see https://github.com/sitespeedio/sitespeed.io/issues/2159
  return typeof timing === 'number' && timing !== -1 && !Number.isNaN(timing);
}

export class DomainsAggregator {
  constructor() {
    this.domains = {};
    this.groups = {};
  }

  addToAggregate(har, url) {
    const mainDomain = parseDomainName(url);
    if (this.groups[mainDomain] === undefined) {
      this.groups[mainDomain] = {};
    }
    const firstPageId = har.log.pages[0].id;

    for (const entry of har.log.entries) {
      if (entry.pageref !== firstPageId) {
        // Only pick the first request out of multiple runs.
        continue;
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

      for (const name of timingNames) {
        const timing = entry.timings[name];

        if (isValidTiming(timing)) {
          domain[name].push(timing);
          groupDomain[name].push(timing);
        }
      }
      this.domains[domainName] = domain;
      this.groups[mainDomain][domainName] = groupDomain;
    }
  }
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
}
