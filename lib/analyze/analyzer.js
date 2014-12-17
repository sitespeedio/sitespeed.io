/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var yslow = require('./yslow'),
  gpsi = require('./gpsi'),
  browsertime = require('./browsertime'),
  webpagetest = require('./webpagetest'),
  screenshots = require('./screenshots'),
  phantomjs = require('./phantom'),
  async = require('async');

function Analyzer() {}

Analyzer.prototype.analyze = function(urls, collector, config, downloadErrors, analysisErrors, urlAnalysedCallback,
  completionCallback) {

  /**
  To keep it simple, we run each task in series so
  that they will not interfere with each other
  */
  var analyzers = [];

  if (config.runYslow) {
    analyzers.push(yslow);
  }
  if (config.phantomjs) {
    analyzers.push(phantomjs);
  }
  if (config.gpsiKey) {
    analyzers.push(gpsi);
  }
  if (config.browsertime) {
    browsertime.setup(config);
    analyzers.push(browsertime);
  }
  if (config.wptHost) {
    analyzers.push(webpagetest);
  }
  if (config.screenshot) {
    analyzers.push(screenshots);
  }

  var preTasks = analyzers.map(function (a) {
    return a.preAnalysis;
  }).filter(function (f) {
        return f instanceof Function;
      });

  var postTasks = analyzers.map(function (a) {
    return a.postAnalysis;
  }).filter(function (f) {
    return f instanceof Function;
  });

  async.series([
        async.applyEach(preTasks),
        function (callback) {
          async.mapSeries(analyzers,
              function (a, cb) {
                a.analyze(urls, config, cb);
              },
              function (error, results) {
                analysisDone(error, results, analysisErrors);
                callback(null);
              });
        },
        async.applyEach(postTasks)
      ],
      function (err) {
        completionCallback(err, downloadErrors, analysisErrors);
      });

  var extractDataForType = function(type, data) {
    var result;
    switch (type) {
      case 'browsertime': {
        result = {
          browsertime: data.map(function(run) { return run.browsertime; }),
          har: data.map(function(run) { return run.har; })
        };
      }
        break;

      default:
        result = data;
        break;
    }

    return result;
  };

  var analysisDone = function(error, analysisResults, analysisErrors) {
    if (error) {
      return;
    }

    var dataPerUrl = {};

    analysisResults.forEach(function(result) {
      var errors = result.errors;
      for (var url in  errors) {
        if (errors.hasOwnProperty(url)) {
          var e = analysisErrors[url] || {};
          e[result.type] = errors[url];
          analysisErrors[url] = e;
        }
      }

      var data = result.data;
      for (url in  data) {
        if (data.hasOwnProperty(url)) {
          var pageData = dataPerUrl[url] || {};
          pageData[result.type] = extractDataForType(result.type, data[url]);
          dataPerUrl[url] = pageData;
        }
      }
    });

    for (var url in dataPerUrl) {
      if (dataPerUrl.hasOwnProperty(url)) {
        var d = dataPerUrl[url];
        collector.collectPageData(d);
        urlAnalysedCallback(undefined, url, d);
      }
    }
  };
};

module.exports = Analyzer;
