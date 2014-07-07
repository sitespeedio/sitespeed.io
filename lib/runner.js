/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var crawler = require('./crawler'),
  Analyzer = require('./analyze/analyzer'),
  HTMLRenderer = require('./htmlRenderer'),
  Collector = require('./collector'),
  JUnitRenderer = require('./junitRenderer'),
  Graphite = require('./graphite'),
  logger = require('./log'),
  path = require('path'),
  fs = require('fs-extra'),
  config = require('./conf'),
  async = require("async"),
  log = require('winston');

module.exports = Runner;

function Runner() {
  this.analyzer = new Analyzer();
  this.collector = new Collector();
  this.htmlRenderer = new HTMLRenderer();
  this.junitRenderer = new JUnitRenderer(this.collector);
  this.graphite = new Graphite(config.graphiteHost, config.graphitePort, config
    .graphiteNamespace, this.collector);
}

Runner.prototype.run = function(finshedCb) {
  finshedCb = finshedCb || function() {};
  // setup the directories needed
  fs.mkdirsSync(path.join(config.run.absResultDir, config.dataDir));

  // store the config file, so we can backtrack errors and/or use it again
  fs.writeFile(path.join(config.run.absResultDir, 'config.json'), JSON.stringify(
    config), function(err) {
    if (err) throw err;
  });

  var analyzer = this.analyzer;
  var junitRenderer = this.junitRenderer;
  var htmlRenderer = this.htmlRenderer;
  var collector = this.collector;
  var graphite = this.graphite;

  /**
  This is the main flow of the application and this is what we do:
    1. Fetch the URL:s that will be analyzed, either we crawl a site using
       a start url or we read the URL:s from a file.
    2. Finetune the URL:s = do other thing that's needed, store them to disk etc.
    3. Let the analyser take a go at the URL:s, the analyzer
       got a lot to do, lets check the analyzer.js file
    4. The analyze is finished, lets create output
  **/
  async.waterfall([
    function(cb) {
      fetchUrls(crawler, cb);
    },
    function(okUrls, errorUrls, cb) {
      fineTuneUrls(okUrls, errorUrls, cb);
    },
    function(urls, downloadErrors, cb) {
      analyze(analyzer, urls, collector, downloadErrors, junitRenderer, htmlRenderer, cb);
    },
    function(downloadErrors, analysisErrors, cb) {
      createOutput(collector, htmlRenderer, graphite, junitRenderer, downloadErrors, analysisErrors, cb);
    }
  ], function(err, result) {
    if (err)
        log.log('error', err);
    finshedCb();
  });
};

function fineTuneUrls(okUrls, errorUrls, callback) {
  var downloadErrors = {};
  Object.keys(errorUrls).forEach(function(url) {
    log.log('error', "Failed to download " + url);
    downloadErrors[url] = errorUrls[url];
  });

  // limit
  if (config.maxPagesToTest) {
    if (okUrls.length > config.maxPagesToTest)
      okUrls.length = config.maxPagesToTest;
  }
  if (okUrls.length === 0) {
    log.log('info', "Didn't get any URLs");
    throw Error('No URL:s to analyze');
  }
  saveUrls(okUrls);
  callback(null, okUrls, downloadErrors);
}

function fetchUrls(crawler, callback) {
  if (config.url) {
    log.log('info', "Will crawl from start point " + config.url +
      " with crawl depth " + config.deep);
    crawler.crawl(config.url, function(okUrls, errorUrls) {
      callback(null, okUrls, errorUrls);
    });
  } else {
    var urls = fs.readFileSync(config.file).toString().split("\n");
    urls = urls.filter(function(l) {
      return l.length > 0;
    });
    callback(null, urls, {});
  }
}

function analyze(analyzer, urls, collector, downloadErrors, junitRenderer, htmlRenderer, callback) {
  var analysisErrors = {};
  log.log('info', "Will analyze " + urls.length + " pages");
  analyzer.analyze(urls, collector, downloadErrors, analysisErrors, function(err, url, pageData) {

    if (err) {
      log.log('error', 'Could not analyze ' + url + ' (' + JSON.stringify(err) +
        ')');
      analysisErrors[url] = err;
      return;
    }

    if (config.junit)
      junitRenderer.renderForEachPage(url, pageData);
    htmlRenderer.renderPage(url, pageData, function() {});
  }, callback);
}


function saveUrls(urls) {
  fs.writeFile(path.join(config.run.absResultDir, 'data', 'urls.txt'), urls.join(
    "\n"), function(err) {
    if (err) {
      throw err;
    }
  });
}

function createOutput(collector, htmlRenderer, graphite, junitRenderer, downloadErrors, analysisErrors, callBack) {
  log.log('info', 'Done analyzing urls');

  // fetch all the data we need, and then generate the output
  var aggregates = collector.createAggregates();
  var assets = collector.createCollections().assets;
  var pages = collector.createCollections().pages;

  /* We got a lot of things to do, lets generate all results
  in parallel and then let us know when we are finished
  */
  async.parallel({
      renderSummary: function(cb) {
        htmlRenderer.renderSummary(aggregates, cb);
      },
      renderAssets: function(cb) {
        htmlRenderer.renderAssets(assets, cb);
      },
      renderPages: function(cb) {
        htmlRenderer.renderPages(pages, cb);
      },
      renderRules: function(cb) {
        // TODO the rules needs to be generated after ...
        htmlRenderer.renderRules(cb);
      },
      renderErrors: function(cb) {
        htmlRenderer.renderErrors(downloadErrors, analysisErrors, cb);
      },
      renderScreenshots: function(cb) {
        if (config.screenshot) {
          htmlRenderer.renderScreenshots(pages, cp);
        } else cb();
      },
      sendToGraphite: function(cb) {
        if (config.graphiteHost)
          graphite.sendPageData(aggregates, pages, cb);
        else cb();
      },
      renderJUnit: function(cb) {
        if (config.junit)
          junitRenderer.renderAfterFullAnalyse(cb);
        else cb();
      }
    },
    function(err, results) {
      if (!err)
        log.log('info', "Wrote results to " + config.run.absResultDir);
      callBack();
    });
}
