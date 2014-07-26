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
  os = require('os'),
  EOL = os.EOL,
  binPath = require('phantomjs').path,
  childProcess = require('child_process'),
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
  logVersions();
  var self = this;
  if (config.sites) {
      this.sites = {};
      var urls = fs.readFileSync(config.sites).toString().split(EOL);
      var queue = async.queue(this._setupSite, 1);
      log.log('info', 'Analyze '  + urls.length + ' sites');
    urls.forEach(function (url) {
      if (url!=="") queue.push({
        'url': url,
        'runner': self
      }, function() {
        log.log('info', "Finished with site " + url);
      });
    });
    queue.drain = function() {
      async.parallel({
          copySiteAssets: function(cb) {
            self.htmlRenderer.copyAssets(path.join(config.run.absResultDir,'..'), cb);
          },
          renderSites: function(cb) {
            self.htmlRenderer.renderSites(self.sites, cb);
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

    this._fetchData(finshedCb);
  }
};


Runner.prototype._setupSite = function(args, cb) {
  var url = args.url;
  config.url= url;
  config.urlObject = urlParser.parse(config.url);
  config.run.absResultDir = path.join(__dirname, '../',config.resultBaseDir, 'sites', dateFormat(config.run.date, "yyyy-mm-dd-HH-MM-ss"), config.urlObject.hostname );
  // setup the directories needed
  fs.mkdirsSync(path.join(config.run.absResultDir, config.dataDir));
  args.runner._fetchData(cb);
};

Runner.prototype._fetchData = function(cb) {
  var self = this;

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
      self._fetchUrls(crawler, cb);
    },
    function(okUrls, errorUrls, cb) {
      self._fineTuneUrls(okUrls, errorUrls, cb);
    },
    function(urls, downloadErrors, cb) {
      self._analyze(urls, downloadErrors, cb);
    },
    function(downloadErrors, analysisErrors, cb) {
      self._createOutput(downloadErrors, analysisErrors, cb);
    }
  ], function(err, result) {
    if (err)
        log.log('error', err);
    cb();
  });
};

Runner.prototype._fineTuneUrls = function (okUrls, errorUrls, callback) {
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
};

Runner.prototype._fetchUrls = function (crawler, callback) {
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
};

Runner.prototype._analyze = function (urls, downloadErrors, callback) {
  var analysisErrors = {};
  var self = this;
  log.log('info', "Will analyze " + urls.length + " pages");
  this.analyzer.analyze(urls, this.collector, downloadErrors, analysisErrors, function(err, url, pageData) {

    if (err) {
      log.log('error', 'Could not analyze ' + url + ' (' + JSON.stringify(err) +
        ')');
      analysisErrors[url] = err;
      return;
    }

    if (config.junit)
      self.junitRenderer.renderForEachPage(url, pageData);
    self.htmlRenderer.renderPage(url, pageData, function() {});
  }, callback);
};


function saveUrls(urls) {
  fs.writeFile(path.join(config.run.absResultDir, 'data', 'urls.txt'), urls.join(
    EOL), function(err) {
    if (err) {
      throw err;
    }
  });
}

function logVersions() {
  /*
  log.log('info', 'OS:' + os.platform() + ' release:' + os.release());
  log.log('info', 'sitespeed.io:' + require("../package.json").version);
  childProcess.execFile(binPath, ['--version'], {
    timeout: 120000
  }, function(err, stdout, stderr) {
    log.log('info', 'phantomjs:' + stdout);
  });

  childProcess.exec('java -version', {
    timeout: 120000
  }, function(err, stdout, stderr) {
    log.log('info', 'java:' + stderr);
  });
  */
}

Runner.prototype._createOutput = function (downloadErrors, analysisErrors, callBack) {
  log.log('info', 'Done analyzing urls');

  // fetch all the data we need, and then generate the output
  var aggregates = this.collector.createAggregates();
  var assets = this.collector.createCollections().assets;
  var pages = this.collector.createCollections().pages;

  var self = this;

  if (this.sites)
    this.sites[config.url] = aggregates;

  /* We got a lot of things to do, lets generate all results
  in parallel and then let us know when we are finished
  */
  async.parallel({
      renderSummary: function(cb) {
        self.htmlRenderer.renderSummary(aggregates, cb);
      },
      renderAssets: function(cb) {
        self.htmlRenderer.renderAssets(assets, cb);
      },
      renderPages: function(cb) {
        self.htmlRenderer.renderPages(pages, cb);
      },
      renderRules: function(cb) {
        // TODO the rules needs to be generated after ...
        self.htmlRenderer.renderRules(cb);
      },
      renderErrors: function(cb) {
        self.htmlRenderer.renderErrors(downloadErrors, analysisErrors, cb);
      },
      copyAssets: function(cb) {
        self.htmlRenderer.copyAssets(config.run.absResultDir, cb);
      },
      renderScreenshots: function(cb) {
        if (config.screenshot) {
          self.htmlRenderer.renderScreenshots(pages, cb);
        } else cb();
      },
      sendToGraphite: function(cb) {
        if (config.graphiteHost)
          self.graphite.sendPageData(aggregates, pages, cb);
        else cb();
      },
      renderJUnit: function(cb) {
        if (config.junit)
          self.junitRenderer.renderAfterFullAnalyse(cb);
        else cb();
      }
    },
    function(err, results) {
      if (!err)
        log.log('info', "Wrote results to " + config.run.absResultDir);
      callBack();
    });
};
