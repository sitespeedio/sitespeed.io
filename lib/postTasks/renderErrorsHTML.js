var render = require('../util/htmlRenderer');

exports.task = function(result, config, cb) {
  var renderData = {
    'errors': {
      'downloadErrorUrls': result.downloadErrors,
      'analysisErrorUrls': result.analysisErrors
    },
    'totalErrors': Object.keys(result.downloadErrors).length + Object.keys(result.analysisErrors).length,
    'config': config,
    'numberOfPages': result.numberOfAnalyzedPages,
    'pageMeta': {
      'title': 'Pages that couldnt be analyzed',
      'description': 'Here are the pages that couldnt be analyzed by sitespeed.io',
      'isErrors': true
    }
  };
  render('errors', renderData, config.run.absResultDir, cb);
};