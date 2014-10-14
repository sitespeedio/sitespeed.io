var render = require('../util/htmlRenderer');

exports.task = function(result, config, cb) {

  var sorted = result.assets.sort(function(asset, asset2) {
    return asset2.count - asset.count;
  });

  var renderData = {
    'assets': sorted.length > 200 ? sorted.slice(0, 200) : sorted,
    'config': config,
    'numberOfPages': result.numberOfAnalyzedPages,
    'pageMeta': {
      'title': 'The most used assets',
      'description': 'A list of the most used assets for the analyzed pages.',
      'isAssets': true
    }
  };
  render('assets', renderData, config.run.absResultDir, cb);
};