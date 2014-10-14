var path = require('path'),
  fs = require('fs-extra');
exports.task = function(result, config, cb) {
  var summary = path.join(config.run.absResultDir, config.dataDir, 'summary.json');
  fs.writeFile(summary, JSON.stringify(result.aggregates), function(err) {
    if (err) {
      log.log('error', 'Couldnt write summary json file to disk:' + summary + ' ' + err);
    }
    cb();
  });
};