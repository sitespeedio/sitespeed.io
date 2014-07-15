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
  dateFormat = require('dateformat'),
  fs = require('fs-extra'),
  config = require('./conf'),
  async = require("async"),
  urlParser = require('url'),
  EOL = require('os').EOL,
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

  if (config.sites) {
      var urls = fs.readFileSync(config.sites).toString().split(EOL);
      var queue = async.queue(doer, 1);
      var analyzer = this.analyzer;
      var collector = this.collector;
      var htmlRenderer = this.htmlRenderer;
      var graphite = this.graphite;
      var junitRenderer = this.junitRenderer;
      log.log('info', 'Analyze '  + urls.length + ' sites');
    urls.forEach(function (url) {
      if (url!=="") queue.push({
        'url': url,
        'analyzer': analyzer,
        'junitRenderer': junitRenderer,
        'htmlRenderer': htmlRenderer,
        'collector': collector,
        'graphite': graphite
      }, function() {
        log.log('info', "Finished with site " + url);
      });
    });
    queue.drain = function() {

      async.parallel({
          copySiteAssets: function(cb) {
              htmlRenderer.copyAssets(path.join(config.run.absResultDir,'..'), cb);
          },
          renderSites: function(cb) {
            htmlRenderer.renderSites(cb);
          }
        },
          function(err, results) {
            if (!err)
              log.log('info', "Wrote sites result to " + config.run.absResultDir);
            finshedCb();
          });
    };

  }
  else {
    // setup the directories needed
    fs.mkdirsSync(path.join(config.run.absResultDir, config.dataDir));

    // TODO needs t be stored for sites also
    // store the config file, so we can backtrack errors and/or use it again
    fs.writeFile(path.join(config.run.absResultDir, 'config.json'), JSON.stringify(
      config), function(err) {
      if (err) throw err;
    });

    fetchData(this.analyzer, this.junitRenderer, this.htmlRenderer, this.collector, this.graphite, finshedCb);
  }
};


function doer(args, cb) {
  var url = args.url;
  config.url= url;
  config.urlObject = urlParser.parse(config.url);
  config.run.absResultDir = path.join(__dirname, '../',config.resultBaseDir, 'sites', dateFormat(config.run.date, "yyyy-mm-dd-HH-MM-ss"), config.urlObject.hostname );
  // setup the directories needed
  fs.mkdirsSync(path.join(config.run.absResultDir, config.dataDir));
  fetchData(args.analyzer, args.junitRenderer, args.htmlRenderer, args.collector, args.graphite,cb);
}

function fetchData(analyzer, junitRenderer, htmlRenderer, collector, graphite, cb) {

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
    cb();
  });
}

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
    var urls = fs.readFileSync(config.file).toString().split(EOL);
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
      copyAssets: function(cb) {
        htmlRenderer.copyAssets(config.run.absResultDir, cb);
      },
      renderScreenshots: function(cb) {
        if (config.screenshot) {
          htmlRenderer.renderScreenshots(pages, cb);
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
