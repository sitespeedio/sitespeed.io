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
  To keep it simple, we run each task in a serie so
  that they will not interfer with each other
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
  if (config.wptUrl) {
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
              function (errors, results) {
                analysisDone(errors, results);
                callback(null);
              });
        },
        async.applyEach(postTasks)
      ],
      function (err) {
        completionCallback(err, downloadErrors, analysisErrors);
      });

  var analysisDone = function(errors, results) {
    // Lets go through all the urls and create
    // pageData and collect it
    urls.forEach(function(url) {
      var err = '';
      var pageData = {};
      results.forEach(function(result) {
        // if the result is empty, take the next one
        if (!result.type) {
          return;
        } else {
          Object.keys(result.data).forEach(function(dataUrl) {

            // for the mathing URL, take the data and populate the pageData objekt
            if (dataUrl === url) {
              // all browser time data is in an array, because
              // we will run browsertime for eahc
              if (result.type === 'browsertime') {
                result.data[url].forEach(function(runPerBrowser) {
                  if (pageData.browsertime) {
                    pageData.browsertime.push(runPerBrowser.browsertime);
                  } else {
                    pageData.browsertime = [runPerBrowser.browsertime];
                  }
                  if (pageData.har) {
                    pageData.har.push(runPerBrowser.har);
                  } else {
                    pageData.har = [runPerBrowser.har];
                  }
                });
              }
              // WPT holds both the WPT and HAR info
              else if (result.type === 'webpagetest') {
                pageData[result.type] = result.data[url].wpt;
                if (pageData.har) {
                  pageData.har.push(result.data[dataUrl].har);
                } else {
                  pageData.har = [result.data[dataUrl].har];
                }
                // take care of all the other cases
              } else {
                pageData[result.type] = result.data[url];
              }
            }
          });
        }

        Object.keys(result.errors).forEach(function(errorUrl) {
          if (errorUrl === url) {
            err += result.type + ' ' + result.errors[url];
          }
        });

      });

      collector.collectPageData(pageData);
      urlAnalysedCallback(err, url, pageData);
    });
  };
};

module.exports = Analyzer;
