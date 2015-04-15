/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var util = require('../util/util'),
    RequestTiming = require('../requestTiming'),
    winston = require('winston');
var domains = {};

exports.processPage = function(pageData) {
  var log = winston.loggers.get('sitespeed.io');
  var harData = [];
  if (pageData.browsertime) {
    Array.prototype.push.apply(harData, pageData.browsertime.har);
  }
  if (pageData.webpagetest) {
    Array.prototype.push.apply(harData, pageData.webpagetest.har);
  }
  var pageURL = util.getURLFromPageData(pageData);
  harData.forEach(function(har) {
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
          domain.size.total = domain.size.total + entry.response.content.size;
          domain.size[util.getContentType(entry.response.content.mimeType)] =
          domain.size[util.getContentType(entry.response.content.mimeType)] + entry.response.content.size;
        } else {
          log.log('info', 'Missing timings in the HAR');
        }

      } else {
        if (entry.timings) {
          total = entry.timings.blocked + entry.timings.dns + entry.timings.connect + entry.timings.ssl + entry.timings
              .send + entry.timings.wait + entry.timings.receive;

          domains[util.getHostname(entry.request.url)] = {
            domain: util.getHostname(entry.request.url),
            blocked: new RequestTiming(entry.timings.blocked, entry.request.url, pageURL),
            dns: new RequestTiming(entry.timings.dns, entry.request.url, pageURL),
            connect: new RequestTiming(entry.timings.connect, entry.request.url, pageURL),
            ssl: new RequestTiming(entry.timings.ssl, entry.request.url, pageURL),
            send: new RequestTiming(entry.timings.send, entry.request.url, pageURL),
            wait: new RequestTiming(entry.timings.wait, entry.request.url, pageURL),
            receive: new RequestTiming(entry.timings.receive, entry.request.url, pageURL),
            total: new RequestTiming(total, entry.request.url, pageURL),
            size: {
              total: entry.response.content.size,
              css: 0,
              doc: 0,
              js: 0,
              image: 0,
              font: 0,
              flash: 0,
              unknown: 0
            },
            count: 1
          };
          domains[util.getHostname(entry.request.url)].size[util.getContentType(entry.response.content.mimeType)] = entry.response.content.size;
        } else {
          log.log('info', 'Missing timings in the HAR');

        }
      }
    });
  });
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
