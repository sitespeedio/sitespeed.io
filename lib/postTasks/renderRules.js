var render = require('../util/htmlRenderer');

exports.task = function(result, config, cb) {
  var renderData = {
    'ruleDictionary': result.ruleDictionary,
    'config': config,
    'pageMeta': {
      'title': 'The sitespeed.io rules used by this run',
      'description': '',
      'isRules': true
    }
  };
  render('rules', renderData, config.run.absResultDir, cb);
};