var fs = require('fs-extra'),
  path = require('path');

exports.task = function(result, config, cb) {
  fs.copy(path.join(__dirname, '../../assets/'), config.run.absResultDir, function(err) {
    if (err) {
      throw err;
    }
    cb();
  });
};