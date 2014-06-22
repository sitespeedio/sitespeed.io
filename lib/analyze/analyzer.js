/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var path = require('path'),
  config = require('./../conf'),
  yslow = require('./yslow'),
  gpsi = require('./gpsi'),
  browsertime = require('./browsertime'),
  webpagetest = require('./webpagetest'),
  screenshots = require('./screenshots'),
  fs = require('fs-extra'),
  log = require('winston'),
  async = require("async");

module.exports = Analyzer;

function Analyzer(completionCallback) {
  this.completionCallback = completionCallback;
}

Analyzer.prototype.analyze = function(urls, collector, urlAnalysedCallback) {
  var self = this;
  if (urls.length === 0) {
    self.completionCallback();
  }

  var tasks = [
    function(asyncDoneCallback) {
      if (config.runYslow)
        yslow.analyze(urls, asyncDoneCallback);
      else asyncDoneCallback(undefined, {});
    },
    function(asyncDoneCallback) {
      if (config.googleKey)
        gpsi.analyze(urls, asyncDoneCallback);
      else asyncDoneCallback(undefined, {});
    },
    function(asyncDoneCallback) {
      if (config.browser)
        browsertime.analyze(urls, asyncDoneCallback);
      else asyncDoneCallback(undefined, {});
    },
    function(asyncDoneCallback) {
      if (config.webpagetest)
        webpagetest.analyze(urls, asyncDoneCallback);
      else asyncDoneCallback(undefined, {});
    },
    function(asyncDoneCallback) {
      if (config.screenshot)
        screenshots.analyze(urls, asyncDoneCallback);
      else asyncDoneCallback(undefined, {});
    }
  ];

  async.series(tasks, function(errors, results) {
    // Lets go through all the urls and create
    // pageData and collect it
    urls.forEach(function(url) {
      var err = '';
      var pageData = {};
      results.forEach(function(result) {
        // if the result is empty, take the next one
        if (!result.type) return;
        else {
          Object.keys(result.data).forEach(function(dataUrl) {
            // There's an ugly hack for browsertime, since we can have mutiple
            // results, the url for BT also contains the browsername
            if (result.type === 'browsertime-har') {
              var urlWithoutBrowserName = dataUrl.substr(0, dataUrl.lastIndexOf(
                '-'));
              if (urlWithoutBrowserName === url) {
                if (pageData.browsertime) pageData.browsertime.push(
                  result.data[dataUrl].browsertime);
                else pageData.browsertime = [result.data[dataUrl].browsertime];
                if (pageData.har) pageData.har.push(result.data[dataUrl].har);
                else pageData.har = [result.data[dataUrl].har];
              }
            }
            // take care of other data sources
            else if (dataUrl === url)
              pageData[result.type] = result.data[url];
          });
        }

        Object.keys(result.errors).forEach(function(errorUrl) {
          if (errorUrl === url)
            err += result.type + ' ' +  result.errors[url];
        });

      });
      collector.collectPageData(pageData);
      urlAnalysedCallback(err, url, pageData);
    });
    self.completionCallback(undefined);
  });
};
