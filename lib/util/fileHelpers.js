var fs = require('fs-extra'),
  path = require('path'),
  log = require('winston');

module.exports = {

  save: function(path, data) {
    fs.writeFile(path, data,
      function(err) {
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
  }

};
