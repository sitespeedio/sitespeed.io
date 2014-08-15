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

        if (domain) {
          if (entry.timings) {
            domain.count++;
            domain.blocked.push(entry.timings.blocked);
            domain.dns.push(entry.timings.dns);
            domain.connect.push(entry.timings.connect);
            domain.ssl.push(entry.timings.ssl);
            domain.send.push(entry.timings.send);
            domain.wait.push(entry.timings.wait);
            domain.wait.push(entry.timings.receive);
          } else {
            console.log("Missing ...");
          }

        } else {
          if (entry.timings) {
            domains[util.getHostname(entry.request.url)] = {
              domain: util.getHostname(entry.request.url),
              blocked: new Stats().push(entry.timings.blocked),
              dns: new Stats().push(entry.timings.dns),
              connect: new Stats().push(entry.timings.connect),
              ssl: new Stats().push(entry.timings.ssl),
              send: new Stats().push(entry.timings.send),
              wait: new Stats().push(entry.timings.wait),
              receive: new Stats().push(entry.timings.receive),
              count: 1
            };
          } else {
            console.log("Missing ...");

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
