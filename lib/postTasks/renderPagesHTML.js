/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var columnsMetaData = require('../../conf/columnsMetaData.json'),
  render = require('../util/htmlRenderer');

exports.task = function(result, config, cb) {
  if (config.html) {
    var renderData = {
      'pages': result.pages,
      'columnsMeta': columnsMetaData,
      'config': config,
      'ruleDictionary': result.ruleDictionary, // TODO
      'numberOfPages': result.numberOfAnalyzedPages,
      'pageMeta': {
        'title': 'All pages information',
        'description': 'All request data, for all the pages',
        'isPages': true
      }
    };

    render('pages', renderData, config.run.absResultDir, cb);
  } else {
    cb();
  }
};
