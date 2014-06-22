/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Stats = require('fast-stats').Stats;
var util = require('../../util');
var timeMetrics = {};


var descriptions = {};
descriptions.firstPaintTime = 'This is when the first paint happens on the screen, reported by the browser.';
descriptions.serverConnectionTime = 'How long time it takes to connect to the server. Definition: connectEnd - connectStart';
descriptions.domainLookupTime = 'The time it takes to do the DNS lookup. Definition: domainLookupEnd - domainLookupStart';
descriptions.pageLoadTime = 'The time it takes for page to load, from initiation of the pageview (e.g., click on a page link) to load completion in the browser. Important: this is only relevant to some pages, depending on how you page is built. Definition: loadEventStart - navigationStart';
descriptions.pageDownloadTime = 'How long time does it take to download the page (the HTML). Definition: responseEnd - responseStart';
descriptions.serverResponseTime = 'How long time does it take until the server respond. Definition: responseStart - requestStart';
descriptions.domContentLoadedTime = "The time the browser takes to parse the document and execute deferred and parser-inserted scripts including the network time from the user's location to your server. Definition: domContentLoadedEventStart - navigationStart";
descriptions.domInteractiveTime = "The time the browser takes to parse the document, including the network time from the user's location to your server. Definition: domInteractive - navigationStart";
descriptions.redirectionTime = 'Time spent on redirects. Definition: fetchStart - navigationStart';
descriptions.backEndTime = 'The time it takes for the network and the server to generate and start sending the HTML. Definition: responseStart - navigationStart';
descriptions.frontEndTime = 'The time it takes for the browser to parse and create the page. Definition: loadEventStart - responseEnd';

exports.processPage = function(pageData) {

  if (pageData.browsertime) {
    pageData.browsertime.forEach(function(runPerBrowser) {
    var browser = runPerBrowser.pageData.browserName;
    browser = browser.charAt(0).toUpperCase() + browser.slice(1);
    runPerBrowser.timingRuns.forEach(function(run) {
      run.measurements.forEach(function(metric) {
        if (timeMetrics.hasOwnProperty(metric.name))
          timeMetrics[metric.name].push(Number(metric.duration));
        else {
          timeMetrics[metric.name] = new Stats();
          timeMetrics[metric.name].push(Number(metric.duration));
        }
        if (timeMetrics.hasOwnProperty(metric.name + browser)) {
          timeMetrics[metric.name + browser].push(Number(metric.duration));
        } else {
          timeMetrics[metric.name + browser] = new Stats();
          timeMetrics[metric.name + browser].push(Number(metric.duration));
        }
      });
    });
  });
  }
};


exports.generateResults = function() {
  var keys = Object.keys(timeMetrics),
    result = [];

  for (var i = 0; i < keys.length; i++) {
    result.push({
      id: keys[i],
      title: keys[i],
      desc: descriptions[keys[i]]||'Measurement using the User Timing API',
      stats: util.getStatisticsObject(timeMetrics[keys[i]], 0),
      unit: 'milliseconds'
    });
  }

  return result;
};
