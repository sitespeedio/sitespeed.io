'use strict';

const Stats = require('fast-stats').Stats,
  urlParser = require('url'),
  statsHelpers = require('../../support/statsHelpers');

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
        // Temporarily exclude new window's about:blank for Chrome until it
        // can be excluded from browsertime HAR results
        if(entry.request.url == "about:blank") {
            return;
        }
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
    const domainNames = Object.keys(domains);

    return domainNames
      .map((domainName) => domains[domainName])
      .map((domain) => {
        const summary = {
          domainName: domain.domainName,
          requestCount: domain.requestCount,
          totalTime: statsHelpers.summarizeStats(domain.totalTime)
        };

        timingNames.forEach((name) => {
          summary[name] = statsHelpers.summarizeStats(domain[name]);
        });

        return summary;
      });
  }
};
