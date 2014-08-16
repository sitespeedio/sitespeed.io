/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

var util = require('../util');
var domains = {};
var Stats = require('fast-stats').Stats;

exports.processPage = function(pageData) {
  if (pageData.har) {
    pageData.har.forEach(function(har) {
      har.log.entries.forEach(function(entry) {
        var domain = domains[util.getHostname(entry.request.url)];
        var total;
        if (domain) {
          if (entry.timings) {
            domain.count++;
            total = entry.timings.blocked + entry.timings.dns + entry.timings.connect + entry.timings.ssl + entry.timings.send + entry.timings.wait + entry.timings.receive;
            if (total>domain.total.max) {
              domain.slowestUrl = entry.request.url;
            }
            domain.blocked.push(entry.timings.blocked);
            domain.dns.push(entry.timings.dns);
            domain.connect.push(entry.timings.connect);
            domain.ssl.push(entry.timings.ssl);
            domain.send.push(entry.timings.send);
            domain.wait.push(entry.timings.wait);
            domain.receive.push(entry.timings.receive);
            domain.total.push(total);
          } else {
            console.log('Missing timings in the HAR');
          }

        } else {
          if (entry.timings) {
            total = entry.timings.blocked + entry.timings.dns + entry.timings.connect + entry.timings.ssl + entry.timings.send + entry.timings.wait + entry.timings.receive;

            domains[util.getHostname(entry.request.url)] = {
              domain: util.getHostname(entry.request.url),
              blocked: new Stats().push(entry.timings.blocked),
              dns: new Stats().push(entry.timings.dns),
              connect: new Stats().push(entry.timings.connect),
              ssl: new Stats().push(entry.timings.ssl),
              send: new Stats().push(entry.timings.send),
              wait: new Stats().push(entry.timings.wait),
              receive: new Stats().push(entry.timings.receive),
              slowestUrl: entry.request.url,
              total: new Stats().push(total),
              count: 1
            };
          } else {
            console.log('Missing timings in the HAR');
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
