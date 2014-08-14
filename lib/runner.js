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
  async = require('async'),
  urlParser = require('url'),
  os = require('os'),
  EOL = os.EOL,
  binPath = require('phantomjs').path,
  childProcess = require('child_process'),
  log = require('winston');



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
  var self = this;

  async.series([
    function(cb){
      createDataDir(cb);
    },
    function(cb){
      writeConfigurationFile(cb);
    },
    function(cb){
      logVersions(cb);
    }
    ],

    function(err, results){
      if (err) {
        throw err;
      }
        if (config.sites) {
            self._analyzeSites(finshedCb);
          }
        else {
          self._analyzeSite(finshedCb);
        }
    });
};


Runner.prototype._analyzeSites = function(cb) {
  var self = this;
  // store all site data here, use it when parsing
  self.sites = {};

  fs.readFile(config.sites, function(err, data) {
    if (err) {
      throw err;
    }
    var urls = data.toString().split(EOL);
    var queue = async.queue(self._setupConfigurationForSite, 1);
    log.log('info', 'Analyze ' + urls.length + ' sites');
    urls.forEach(function(url) {
      if (url !== '') {
        queue.push({
        'url': url,
        'runner': self
      }, function() {
        log.log('info', 'Finished with site ' + url);
      });
    }
    });

    queue.drain = function() {
      async.parallel({
          copySiteAssets: function(cb) {
            self.htmlRenderer.copyAssets(path.join(config.run.absResultDir, '..'), cb);
          },
          renderSites: function(cb) {
            self.htmlRenderer.renderSites(self.sites, cb);
          }
        },
        function(err, results) {
          if (!err) {
            log.log('info', 'Wrote sites result to ' + config.run.absResultDir);
          }
          cb();
        });
    };
  });
};

Runner.prototype._setupConfigurationForSite = function(args, cb) {
  var url = args.url;
  config.url = url;
  config.urlObject = urlParser.parse(config.url);

  var startPath = (config.resultBaseDir.charAt(0) === path.sep) ? config.resultBaseDir : path.join(__dirname, '../',
    config.resultBaseDir);

  config.run.absResultDir = path.join(startPath, 'sites', dateFormat(config.run.date,
    'yyyy-mm-dd-HH-MM-ss'), config.urlObject.hostname);
  // setup the directories needed
  var dataDir = path.join(config.run.absResultDir, config.dataDir);

  fs.mkdirs(dataDir, function(err) {
    if (err) {
      log.log('error', 'Couldnt create the data dir:' + dataDir + ' ' + err);
      throw err;
    } else {
      args.runner._analyzeSite(cb);
    }
  });

};

Runner.prototype._analyzeSite = function(cb) {
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
    if (err) {
        log.log('error', err);
      }
    cb();
  });
};

Runner.prototype._fineTuneUrls = function (okUrls, errorUrls, callback) {
  var downloadErrors = {};
  Object.keys(errorUrls).forEach(function(url) {
    log.log('error', 'Failed to download ' + url);
    downloadErrors[url] = errorUrls[url];
  });

  // limit
  if (config.maxPagesToTest) {
    if (okUrls.length > config.maxPagesToTest) {
      okUrls.length = config.maxPagesToTest;
    }
  }
  if (okUrls.length === 0) {
    log.log('info', 'Didnt get any URLs');
    callback(new Error('No URLs to analyze'), okUrls, downloadErrors);
  }
  else {
  saveUrls(okUrls);
  callback(null, okUrls, downloadErrors);
  }
};

Runner.prototype._fetchUrls = function (crawler, callback) {
  if (config.url) {
    log.log('info', 'Will crawl from start point ' + config.url +
      ' with crawl depth ' + config.deep);
    crawler.crawl(config.url, function(okUrls, errorUrls) {
      callback(null, okUrls, errorUrls);
    });
  } else {
    fs.readFile(config.file, function (err, data) {
      if (err)  {
        throw err;
      }
      var urls = data.toString().split(EOL);
      urls = urls.filter(function(l) {
        return l.length > 0;
      });

      callback(null, urls, {});
    });
  }
};

Runner.prototype._analyze = function (urls, downloadErrors, callback) {
  var analysisErrors = {};
  var self = this;
  log.log('info', 'Will analyze ' + urls.length + ' pages');
  this.analyzer.analyze(urls, this.collector, downloadErrors, analysisErrors, function(err, url, pageData) {

    if (err) {
      log.log('error', 'Could not analyze ' + url + ' (' + JSON.stringify(err) +
        ')');
      analysisErrors[url] = err;
      return;
    }

    if (config.junit) {
      self.junitRenderer.renderForEachPage(url, pageData);
    }
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

function createDataDir(cb) {
  // create the home data dir
  var dataDir = path.join(config.run.absResultDir, config.dataDir);
  fs.mkdirs(dataDir, function(err) {
    if (err) {
      throw err;
    }
    cb(err, null);
  });
}

function writeConfigurationFile(cb) {
  // write the configuration file
  var confFile = path.join(config.run.absResultDir, 'config.json');
  fs.writeFile(confFile, JSON.stringify(
    config), function(err) {
      if (err) {
        log.log('error','Couldnt write configuration file to disk:'+ confFile + ' ' +err);
      }
    cb(err, null);
  });
}

function storeSummary(aggregates,cb) {
  var summary = path.join(config.run.absResultDir, config.dataDir, 'summary.json');
  fs.writeFile(summary, JSON.stringify(aggregates), function(err) {
    if(err) {
        log.log('error','Couldnt write summary json file to disk:'+ summary + ' ' +err);
    }
    cb();
});
}

Runner.prototype._createOutput = function (downloadErrors, analysisErrors, callBack) {
  log.log('info', 'Done analyzing urls');

  // fetch all the data we need, and then generate the output
  var aggregates = this.collector.createAggregates();
  var assets = this.collector.createCollections().assets;
  var pages = this.collector.createCollections().pages;

  var self = this;

  if (this.sites) {
    this.sites[config.url] = aggregates;
  }

  /* We got a lot of things to do, lets generate all results
  in parallel and then let us know when we are finished
  */
  async.parallel({
      storeSummary: function(cb) {
          storeSummary(aggregates, cb);
      },
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
        } else {
          cb();
        }
      },
      sendToGraphite: function(cb) {
        if (config.graphiteHost) {
          self.graphite.sendPageData(aggregates, pages, cb);
        } else {
          cb();
        }
      },
      renderJUnit: function(cb) {
        if (config.junit) {
          self.junitRenderer.renderAfterFullAnalyse(cb);
        }
        else {
          cb();
        }
      }
    },
    function(err, results) {

      // TODO this can be cleaner
      // We clear the number of pages tested and
      // the collected data, so it is ready for next run
      // used when testing multiple sites
      self.htmlRenderer.numberOfAnalyzedPages = 0;
      self.collector.clear();

      if (!err) {
        log.log('info', 'Wrote results to ' + config.run.absResultDir);
      }
      callBack();
    });
};

function logVersions(cb) {

  async.parallel([
      function(callback) {
        childProcess.execFile(binPath, ['--version'], {
          timeout: 120000
        }, function(err, stdout, stderr) {
          callback(null, stdout);
        });
      },
      function(callback) {
        childProcess.exec('java -version', {
          timeout: 120000
        }, function(err, stdout, stderr) {
          callback(null, stderr);
        });
      }
    ],
    function(err, results) {
      log.log('info', 'OS: ' + os.platform() + ' ' + os.release() + ' sitespeed:' + require('../package.json').version +
        ' ' + ' phantomJs:' + results[0].replace(EOL,'') + ' java:' + results[1].split(EOL)[0]);
      cb(null, null);
    });

}

module.exports = Runner;
