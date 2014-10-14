var render = require('../util/htmlRenderer');
exports.task = function(result, config, cb) {
  if (config.screenshot) {
    var renderData = {
      'pages': result.pages,
      'config': config,
      'pageMeta': {
        'title': '',
        'description': '',
        'isScreenshots': true
      }
    };
    render('screenshots', renderData, config.run.absResultDir, cb);
  } else {
    cb();
  }
};