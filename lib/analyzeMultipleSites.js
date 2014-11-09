var path = require('path'),
  dateFormat = require('dateformat'),
  fs = require('fs-extra'),
  async = require('async'),
  EOL = require('os').EOL,
  urlParser = require('url'),
  log = require('winston'),
  HTMLRenderer = require('./htmlRenderer'),
  util = require('./util/util'),
  fileHelper = require('./util/fileHelpers'),
  AnalyzeOneSite = require('./analyzeOneSite');

function AnalyzeMultipleSites(config) {
  this.config = config;
  // store all site data here, use it when parsing
  this.sites = {};
  this.htmlRenderer = new HTMLRenderer(config);
}

AnalyzeMultipleSites.prototype.run = function(finshedCb) {

  var self = this;
  fs.readFile(self.config.sites, function(err, data) {
    if (err) {
      throw err;
    }
    // strip empty lines
    var urls = data.toString().split(EOL).filter(function(l) {
      return l.length > 0;
    });
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
            fs.copy(path.join(__dirname, '../assets/'), path.join(self.config.run.absResultDir, '..'), function(err) {
              if (err) {
                throw err;
              }
              cb();
            });
          },
          renderSites: function(cb) {
            self.htmlRenderer.renderSites(self.sites, cb);
          }
        },
        function(err, results) {
          if (!err) {
            log.log('info', 'Wrote sites result to ' + self.config.run.absResultDir);
          }
          finshedCb();
        });
    };
  });
};

AnalyzeMultipleSites.prototype._setupConfigurationForSite = function(args, cb) {
  var url = args.url;
  var config = args.runner.config;

  config.url = url;
  config.urlObject = urlParser.parse(config.url);

  var startPath = (config.resultBaseDir.charAt(0) === path.sep) ? config.resultBaseDir : path.join(process.cwd(), path.sep,
    config.resultBaseDir);

  if (!config.outputFolderName) {
    config.startFolder = dateFormat(config.run.date, 'yyyy-mm-dd-HH-MM-ss');
  } else {
    config.startFolder = config.outputFolderName;
  }

  config.run.absResultDir = path.join(startPath, 'sites', config.startFolder, config.urlObject.hostname);
  // setup the directories needed
  var dataDir = path.join(config.run.absResultDir, config.dataDir);

  fileHelper.createDir(dataDir, function(err) {
    if (err) {
      log.log('error', 'Couldnt create the data dir:' + dataDir + ' ' + err);
      throw err;
    } else {
      var analyzeOneSite = new AnalyzeOneSite(config);
      analyzeOneSite.run(function() {
        // when we are finsished store the aggregates data so
        // we can use it to create site info later
        args.runner.sites[config.url] = analyzeOneSite.aggregates;
        cb();
      });
    }
  });

};

module.exports = AnalyzeMultipleSites;
