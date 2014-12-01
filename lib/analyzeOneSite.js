var crawler = require('./crawler/crawler'),
  Analyzer = require('./analyze/analyzer'),
  SiteHTMLRenderer = require('./siteHTMLRenderer'),
  Collector = require('./collector'),
  TestRenderer = require('./tests/testRenderer'),
  path = require('path'),
  async = require('async'),
  fs = require('fs-extra'),
  urlParser = require('url'),
  log = require('winston'),
  util = require('./util/util');

function AnalyzeOneSite(config) {
  this.config = config;
  this.analyzer = new Analyzer();
  this.collector = new Collector(config);
  this.htmlRenderer = new SiteHTMLRenderer(config);
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
    return cb(err);
  });
};

AnalyzeOneSite.prototype._fetchUrls = function(callback) {
  // if we have an url configured, start crawling, else read the URL:s
  // from file
  if (this.config.file) {
    this._readUrlsFromFile(callback);
  } else {
    this._crawl(callback);
  }
};

AnalyzeOneSite.prototype._crawl = function(callback) {
  log.log('info', 'Will crawl from start point ' + this.config.url +
    ' with crawl depth ' + this.config.deep);
  crawler.crawl(this.config.url, this.config, function(okUrls, errorUrls) {
    callback(null, okUrls, errorUrls);
  });
};

AnalyzeOneSite.prototype._readUrlsFromFile = function(callback) {
  var urls = this.config.urls;
  // hack to add the first URL in the list in the config
  this.config.urlObject = urlParser.parse(urls[0]);
  callback(null, urls, {});
};

AnalyzeOneSite.prototype._analyze = function(urls, downloadErrors, callback) {
  var analysisErrors = {};
  var self = this;
  log.log('info', 'Will analyze ' + urls.length + ' pages');
  this.analyzer.analyze(urls, this.collector, this.config, downloadErrors, analysisErrors, function(err, url,
    pageData) {

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

AnalyzeOneSite.prototype._getPostTasks = function(result) {
  var self = this;

  // lets read all post tasks
  var postTasks = [];
  var rootPath = path.join(__dirname, 'postTasks', path.sep);
  fs.readdirSync(rootPath).forEach(function(file) {
    postTasks.push(function(cb) {
      require(rootPath + file).task(result, self.config, cb);
    });
  });

  // if we configured our own post task dir, read them
  if (this.config.postTasksDir) {

    var startPath = (this.config.postTasksDir.charAt(0) === path.sep) ? this.config.postTasksDir : path.join(process.cwd(),
      path.sep,
      this.config.postTasksDir);

    log.log('info', 'Reading post tasks from directory ' + startPath);
    fs.readdirSync(startPath).forEach(function(file) {
      postTasks.push(function(cb) {
        require(fs.realpathSync(startPath + path.sep + file)).task(result, self.config, cb);
      });
    });
  }

  // we add the test runner on the side
  postTasks.push(function(cb) {
    if (self.config.tap ||  self.config.junit) {
      console.log('add test runner');
      self.testRenderer.render(cb);
    } else {
      cb();
    }
  });

  return postTasks;
};

AnalyzeOneSite.prototype._createOutput = function(callBack) {

  var self = this;

  log.log('info', 'Done analyzing urls');

  // fetch all the data we need, and then generate the output
  var aggregates = this.collector.createAggregates();
  var collections = this.collector.createCollections();
  // make the aggregates availible for getting when testing multiple sites
  this.aggregates = aggregates;

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

  // remove pages that couldn't be fetched using YSlow
  if (this.config.runYslow) {
    result.pages = result.pages.filter(function(page) {
      return (page.score !== undefined);
    });
  }

  // get the post task, all the tasks that
  // will do something with the result
  var postTasks = this._getPostTasks(result);

  /* We got a lot of things to do, lets generate all results
  in parallel and then let us know when we are finished
  */
  async.parallel(postTasks,
    function(err, results) {

      // clear the collector for the next run
      self.collector.clear();

      if (!err) {
        log.log('info', 'Wrote results to ' + self.config.run.absResultDir);
      } else {
        log.log('error', 'Couldn\'t create output:' + err);
      }
      // yes we are finished!
      callBack();
    });
};

module.exports = AnalyzeOneSite;
