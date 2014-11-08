var crawler = require('./crawler/crawler'),
  Analyzer = require('./analyze/analyzer'),
  HTMLRenderer = require('./htmlRenderer'),
  Collector = require('./collector'),
  TestRenderer = require('./tests/testRenderer'),
  path = require('path'),
  async = require('async'),
  fs = require('fs-extra'),
  log = require('winston'),
  EOL = require('os').EOL,
  util = require('./util/helpers');

function AnalyzeOneSite(config) {
  this.config = config;
  this.analyzer = new Analyzer();
  this.collector = new Collector(config);
  this.htmlRenderer = new HTMLRenderer(config);
  this.testRenderer = new TestRenderer(config);
  this.downloadErrors = {};
  this.analysisErrors = {};
}

AnalyzeOneSite.prototype.run = function(cb) {
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
      self._fetchUrls(cb);
    },
    function(okUrls, errorUrls, cb) {
      util.fineTuneUrls(okUrls, errorUrls, self.config.maxPagesToTest, self.config.run.absResultDir, cb);
    },
    function(urls, downloadErrors, cb) {
      self._analyze(urls, downloadErrors, cb);
    },
    function(downloadErrors, analysisErrors, cb) {
      self.downloadErrors = downloadErrors;
      self.analysisErrors = analysisErrors;
      self._createOutput(cb);
    }
  ], function(err, result) {
    if (err) {
      log.log('error', err);
    }
    cb();
  });
};

AnalyzeOneSite.prototype._fetchUrls = function(callback) {
  // if we have an url configured, start crawling, else read the URL:s
  // from file
  if (this.config.url) {
    this._crawl(callback);
  } else {
    this._readUrlsFromFile(this.config.file, callback);
  }
};

AnalyzeOneSite.prototype._crawl = function(callback) {
  log.log('info', 'Will crawl from start point ' + this.config.url +
    ' with crawl depth ' + this.config.deep);
  crawler.crawl(this.config.url, this.config, function(okUrls, errorUrls) {
    callback(null, okUrls, errorUrls);
  });
};

AnalyzeOneSite.prototype._readUrlsFromFile = function(file, callback) {
  fs.readFile(file, function(err, data) {
    if (err) {
      throw err;
    }
    var urls = data.toString().split(EOL);
    urls = urls.filter(function(l) {
      return l.length > 0;
    });

    callback(null, urls, {});
  });
};

AnalyzeOneSite.prototype._analyze = function(urls, downloadErrors, callback) {
  var analysisErrors = {};
  var self = this;
  log.log('info', 'Will analyze ' + urls.length + ' pages');
  this.analyzer.analyze(urls, this.collector, this.config, downloadErrors, analysisErrors, function(err, url, pageData) {

    if (err) {
      log.log('error', 'Could not analyze ' + url + ' (' + JSON.stringify(err) +
        ')');
      analysisErrors[url] = err;
      return;
    }

    if (self.config.tap || self.config.junit) {
      self.testRenderer.forEachPage(url, pageData);
    }

    self.htmlRenderer.renderPage(url, pageData, function() {});
  }, callback);
};

AnalyzeOneSite.prototype._createOutput = function(callBack) {

  var self = this;

  log.log('info', 'Done analyzing urls');

  // fetch all the data we need, and then generate the output
  var aggregates = this.collector.createAggregates();

  var collections = this.collector.createCollections();

  var result = {
    date: this.config.run.date,
    config: this.config,
    numberOfAnalyzedPages: this.htmlRenderer.numberOfAnalyzedPages,
    aggregates: aggregates,
    downloadErrors: this.downloadErrors,
    analysisErrors: this.analysisErrors,
    ruleDictionary: this.htmlRenderer.ruleDictionary
  };

  // add all collections to the result
  Object.keys(collections).forEach(function(key) {
    result[key] = collections[key];
  });

  // this is an ugly way, now we are depening on the name
  // page, fix this in later versions :)
  // remove pages that couldn't be fetched using YSlow
  if (this.config.runYslow) {
    result.pages = result.pages.filter(function(page) {
      return (page.score !== undefined);
    });
  }

  // make the aggregates availible for getting when testing multiple sites
  this.aggregates = aggregates;

  var work = [];

  //async.map([path.join(__dirname, 'postTasks', path.sep)], fs.readdir, function(err, results) {
  //   console.log(JSON.stringify(results));
  // });

  var rootPath = path.join(__dirname, 'postTasks', path.sep);
  fs.readdirSync(rootPath).forEach(function(file) {
    work.push(function(cb) {
      require(rootPath + file).task(result, self.config, cb);
    });
  });

  if (this.config.postTasksDir) {
    var extraPostTaskDir = path.join(this.config.postTasksDir, path.sep);
    log.log('info', 'Reading post tasks from directory ' + this.config.postTasksDir);
    fs.readdirSync(extraPostTaskDir).forEach(function(file) {
      work.push(function(cb) {
        require(fs.realpathSync(extraPostTaskDir + file)).task(result, self.config, cb);
      });
    });
  }

  // we add the test runner on the side
  work.push(function(cb) {
    if (self.config.tap ||  self.config.junit) {
      self.testRenderer.render(cb);
    } else {
      cb();
    }
  });


  /* We got a lot of things to do, lets generate all results
  in parallel and then let us know when we are finished
  */
  async.parallel(work,
    function(err, results) {

      // TODO this can be cleaner
      // We clear the number of pages tested and
      // the collected data, so it is ready for next run
      // used when testing multiple sites
      self.htmlRenderer.numberOfAnalyzedPages = 0;
      self.collector.clear();

      if (!err) {
        log.log('info', 'Wrote results to ' + self.config.run.absResultDir);
      }
      callBack();
    });
};

module.exports = AnalyzeOneSite;
