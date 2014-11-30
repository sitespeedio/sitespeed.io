var fs = require('fs-extra'),
  path = require('path'),
  EOL = require('os').EOL,
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

  getFileAsJSON: function(filePath) {
    var fullPathToFile = (filePath.charAt(0) === path.sep) ? filePath : path.join(process.cwd(),
    path.sep, filePath);
    return JSON.parse(fs.readFileSync(fullPathToFile));
  },

  getFileAsArray: function(filePath) {
    var fullPathToFile = (filePath.charAt(0) === path.sep) ? filePath : path.join(process.cwd(),
    path.sep,
    filePath);

   var data = fs.readFileSync(fullPathToFile)
   var urls = data.toString().split(EOL);
      urls = urls.filter(function(l) {
        return l.length > 0;
      });
    return urls;
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
