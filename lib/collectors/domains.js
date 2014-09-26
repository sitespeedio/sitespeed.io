/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

var util = require('../util'),
  domains = {},
  DomainTiming = require('../domainTiming'),
  log = require('winston');

exports.processPage = function(pageData) {
  if (pageData.har) {
    var pageURL = util.getURLFromPageData(pageData);
    pageData.har.forEach(function(har) {
      har.log.entries.forEach(function(entry) {
        var domain = domains[util.getHostname(entry.request.url)];
        var total;
        if (domain) {
          if (entry.timings) {
            domain.count++;
            total = entry.timings.blocked + entry.timings.dns + entry.timings.connect + entry.timings.ssl + entry.timings
              .send + entry.timings.wait + entry.timings.receive;
            domain.blocked.add(entry.timings.blocked, entry.request.url, pageURL);
            domain.dns.add(entry.timings.dns, entry.request.url, pageURL);
            domain.connect.add(entry.timings.connect, entry.request.url, pageURL);
            domain.ssl.add(entry.timings.ssl, entry.request.url, pageURL);
            domain.send.add(entry.timings.send, entry.request.url, pageURL);
            domain.wait.add(entry.timings.wait, entry.request.url, pageURL);
            domain.receive.add(entry.timings.receive, entry.request.url, pageURL);
            domain.total.add(total, entry.request.url, pageURL);
          } else {
            log.log('info', 'Missing timings in the HAR');
          }

        } else {
          if (entry.timings) {
            total = entry.timings.blocked + entry.timings.dns + entry.timings.connect + entry.timings.ssl + entry.timings
              .send + entry.timings.wait + entry.timings.receive;

            domains[util.getHostname(entry.request.url)] = {
              domain: util.getHostname(entry.request.url),
              blocked: new DomainTiming(entry.timings.blocked, entry.request.url, pageURL),
              dns: new DomainTiming(entry.timings.dns, entry.request.url, pageURL),
              connect: new DomainTiming(entry.timings.connect, entry.request.url, pageURL),
              ssl: new DomainTiming(entry.timings.ssl, entry.request.url, pageURL),
              send: new DomainTiming(entry.timings.send, entry.request.url, pageURL),
              wait: new DomainTiming(entry.timings.wait, entry.request.url, pageURL),
              receive: new DomainTiming(entry.timings.receive, entry.request.url, pageURL),
              total: new DomainTiming(total, entry.request.url, pageURL),
              count: 1
            };
          } else {
            log.log('info', 'Missing timings in the HAR');

          }
        }
      });
    });
  }
};

exports.generateResults = function() {
  var values = Object.keys(domains).map(function(key) {
    return domains[key];
  });

  return {
    id: 'domains',
    list: values
  };
};

exports.clear = function() {
  domains = {};
};