var fs = require('fs-extra'),
  async = require('async'),
  path = require('path'),
  binPath = require('phantomjs').path,
  childProcess = require('child_process'),
  log = require('winston'),
  os = require('os'),
  EOL = require('os').EOL;

module.exports = {

  fineTuneUrls: function(okUrls, errorUrls, maxPagesToTest, absResultDir, callback) {
    var downloadErrors = {};
    Object.keys(errorUrls).forEach(function(url) {
      log.log('error', 'Failed to download ' + url);
      downloadErrors[url] = errorUrls[url];
    });

    // limit
    if (maxPagesToTest) {
      if (okUrls.length > maxPagesToTest) {
        okUrls.length = maxPagesToTest;
      }
    }
    if (okUrls.length === 0) {
      log.log('info', 'Didnt get any URLs');
      callback(new Error('No URLs to analyze'), okUrls, downloadErrors);
    } else {
      this.saveUrls(okUrls, absResultDir);
      callback(null, okUrls, downloadErrors);
    }
  },

  saveUrls: function(urls, absResultDir) {
    fs.writeFile(path.join(absResultDir, 'data', 'urls.txt'), urls.join(
      EOL), function(err) {
      if (err) {
        throw err;
      }
    });
  },

  createDir: function(dataDir, cb) {
    // create the home data dir
    fs.mkdirs(dataDir, function(err) {
      if (err) {
        log.log('error', 'Couldn\'t create the dir:' + dataDir +
          '. Probably the user starting sitespeed doesn\'t have the privileges to create the directory. ' + err);
      }
      cb(err, null);
    });
  },

  writeConfigurationFile: function(config, cb) {
    // write the configuration file
    var confFile = path.join(config.run.absResultDir, 'config.json');
    fs.writeFile(confFile, JSON.stringify(
      config), function(err) {
      if (err) {
        log.log('error', 'Couldnt write configuration file to disk:' + confFile + ' ' + err);
      }
      cb(err, null);
    });
  },

  logVersions: function(cb) {

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
        log.log('info', 'OS: ' + os.platform() + ' ' + os.release() + ' sitespeed:' + require('../../package.json').version +
          ' ' + ' phantomJs:' + results[0].replace(EOL, '') + ' java:' + results[1].split(EOL)[0]);
        cb(null, null);
      });

  }
};
