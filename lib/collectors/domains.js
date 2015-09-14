/**
 * Sitespeed.io - How speedy is your site? (https://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var util = require('../util/util'),
  RequestTiming = require('../requestTiming'),
  Stats = require('fast-stats').Stats,
  winston = require('winston');
var domains = {};

exports.processPage = function(pageData) {
  var log = winston.loggers.get('sitespeed.io');
  var harData = [];
  if (pageData.browsertime && pageData.browsertime.har) {
    Array.prototype.push.apply(harData, pageData.browsertime.har);
  }
  if (pageData.webpagetest && pageData.webpagetest.har) {
    Array.prototype.push.apply(harData, pageData.webpagetest.har);
  }

// Workaround to avoid issues when bt doesn't generate a har due to useProxy being set to false
  harData = harData.filter(function(har) {
    return !!har;
  });

  var pageURL = util.getURLFromPageData(pageData);
  harData.forEach(function(har) {
    har.log.entries.forEach(function(entry) {
      var domain = domains[util.getHostname(entry.request.url)];
      var total;
      if (domain) {
        if (entry.timings) {
          total = entry.timings.blocked + entry.timings.dns + entry.timings.connect + entry.timings.ssl +
            entry.timings
            .send + entry.timings.wait + entry.timings.receive;
          domain.blocked.add(entry.timings.blocked, entry.request.url, pageURL);
          domain.dns.add(entry.timings.dns, entry.request.url, pageURL);
          domain.connect.add(entry.timings.connect, entry.request.url, pageURL);
          domain.ssl.add(entry.timings.ssl, entry.request.url, pageURL);
          domain.send.add(entry.timings.send, entry.request.url, pageURL);
          domain.wait.add(entry.timings.wait, entry.request.url, pageURL);
          domain.receive.add(entry.timings.receive, entry.request.url, pageURL);
          domain.total.add(total, entry.request.url, pageURL);
          domain.accumulatedTime += total;
        } else {
          log.log('info', 'Missing timings in the HAR');
        }

      } else {
        if (entry.timings) {
          total = entry.timings.blocked + entry.timings.dns + entry.timings.connect + entry.timings.ssl +
            entry.timings
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
            accumulatedTime: total
          };

        } else {
          log.log('info', 'Missing timings in the HAR');
        }
      }
    });
  });

  // we have HAR files with one page tested multiple times,
  // make sure we only get data from the first run
  // and we kind of add items & size for requests missing
  // but only for the first one

  var pageref = '';
  // add request & size, just do it for the first run
  if (harData.length > 0) {
    harData[0].log.entries.forEach(function(entry) {
      if (pageref === '' || entry.pageref === pageref) {
        pageref = entry.pageref;

        var domain = domains[util.getHostname(entry.request.url)];

        if (domain.count) {
          domain.count++;
        } else {
          domain.count = 1;
        }

        if (domain.size) {
          domain.size.total += entry.response.content.size;
          domain.size[util.getContentType(entry.response.content.mimeType)] +=
            entry.response.content.size;
        } else {
          domain.size = {
            total: entry.response.content.size,
            css: 0,
            doc: 0,
            js: 0,
            image: 0,
            font: 0,
            flash: 0,
            unknown: 0
          };
          domain.size[util.getContentType(entry.response.content.mimeType)] = entry.response.content.size;
        }
      } else {
        // all other har files
        var daDomain = domains[util.getHostname(entry.request.url)];
        if (!daDomain.count) {
          daDomain.count = 1;
        }
        if (!daDomain.size) {
          // this is not perfect, we will miss request in other HAR..s
          daDomain.size = {
            total: entry.response.content.size,
            css: 0,
            doc: 0,
            js: 0,
            image: 0,
            font: 0,
            flash: 0,
            unknown: 0
          };
          daDomain.size[util.getContentType(entry.response.content.mimeType)] = entry.response.content.size;
        }
      }
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
