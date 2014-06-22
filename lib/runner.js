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
  log = require('winston');

module.exports = Runner;

function Runner() {
  var self = this;
  this.analyzer = new Analyzer(function(err) {
    self.analysisComplete(err);
  });
  this.collector = new Collector();
  this.htmlRenderer = new HTMLRenderer();
  this.junitRenderer = new JUnitRenderer(this.collector);
  this.graphite = new Graphite(config.graphiteHost, config.graphitePort, config
    .graphiteNamespace, this.collector);
  this.downloadErrors = {};
  this.analysisErrors = {};
}


Runner.prototype.analysisComplete = function(err) {
  log.log('info', 'Done analyzing urls');

  log.log('info', 'Render summary');
  var aggregates = this.collector.createAggregates();
  this.htmlRenderer.renderSummary(aggregates);

  log.log('info', 'Render assets');
  var assets = this.collector.createCollections().assets;
  this.htmlRenderer.renderAssets(assets);

  log.log('info', 'Render pages');
  var pages = this.collector.createCollections().pages;
  this.htmlRenderer.renderPages(pages);

  log.log('info', 'Render rules');
  this.htmlRenderer.renderRules();

  if (config.screenshot) {
    this.htmlRenderer.renderScreenshots(pages);
  }

  log.log('info', 'Render errors');
  this.htmlRenderer.renderErrors(this.downloadErrors, this.analysisErrors);
  if (config.graphiteHost)
    this.graphite.sendPageData(aggregates, pages);
  if (config.junit)
    this.junitRenderer.renderAfterFullAnalyse();

  log.log('info', "Wrote results to " + config.run.absResultDir);

};


Runner.prototype.run = function() {

  // setup the directories needed
  fs.mkdirsSync(path.join(config.run.absResultDir, config.dataDir));

  // store the config file, so we can backtrack errors and/or use it again
  fs.writeFile(path.join(config.run.absResultDir, 'config.json'), JSON.stringify(
    config), function(err) {
    if (err) throw err;
  });

  console.time("sitespeed.io");
  if (config.url) {
    log.log('info', "Will crawl from start point " + config.url +
      " with crawl depth " + config.deep);
    this.crawl(config.urlObject);
  } else {
    log.log('info', "Will fetch urls from the file " + config.file);
    this.readFromFile(config.file);
  }
};

Runner.prototype.readFromFile = function(file) {
  var urls = fs.readFileSync(file).toString().split("\n");
  urls = urls.filter(function(l) {
    return l.length > 0;
  });
  analyzeUrls(urls);
};

Runner.prototype.crawl = function(url) {
  var self = this;
  crawler.crawl(url, function(okUrls, errorUrls) {
    self.handleResult(okUrls, errorUrls);
  });
};

Runner.prototype.handleResult = function(okUrls, errorUrls) {
  var downloadErrors = this.downloadErrors;
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
    log.log('info', "Didn't get any URLs from the crawl");
    return;
  }

  saveUrls(okUrls);

  this.analyzeUrls(okUrls);
};

function saveUrls(urls) {
  fs.writeFile(path.join(config.run.absResultDir, 'data', 'urls.txt'), urls.join(
    "\n"), function(err) {
    if (err) {
      throw err;
    }
  });
}

Runner.prototype.analyzeUrls = function(urls) {
  console.log("Will analyze " + urls.length + " pages");
  var junitRenderer = this.junitRenderer;
  var htmlRenderer = this.htmlRenderer;
  var analysisErrors = this.analysisErrors;
  this.analyzer.analyze(urls, this.collector, function(err, url, pageData) {

      if (err) {
        log.log('error', 'Could not analyze ' + url + ' (' + JSON.stringify(err) +
          ')');
        analysisErrors[url] = err;
        return;
      }

      if (config.junit)
        junitRenderer.renderForEachPage(url, pageData);
      htmlRenderer.renderPage(url, pageData);
    }


  );
};
