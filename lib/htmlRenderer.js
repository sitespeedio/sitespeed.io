/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var hb = require('handlebars'),
  fs = require('fs-extra'),
  path = require('path'),
  log = require('winston'),
  helpers = require('./util/hbHelpers'),
  columnsMetaData = require('../conf/columnsMetaData.json'),
  async = require('async'),
  ySlowUtil = require('./util/yslowUtil'),
  util = require('./util/util'),
  toplistUtil = require('./util/toplist');

var compiledTemplates = {},
  compiledPartials = {},
  ruleDictionary = {};

function HTMLRenderer(config) {
  this.numberOfAnalyzedPages = 0;
  this.config = config;
  precompileTemplates();
  helpers.registerHelpers();
}

HTMLRenderer.prototype.copyAssets = function(toDir, cb) {
  fs.copy(path.join(__dirname, '../assets/'), toDir, function(err) {
    if (err) {
      throw err;
    }
    cb();
  });
};

HTMLRenderer.prototype.renderPage = function(url, pageData, cb) {
  this.numberOfAnalyzedPages++;

  var renderData = {};
  if (pageData.yslow) {
    renderData = {
      'url': pageData.yslow.originalUrl,
      'score': pageData.yslow.o,
      'size': ySlowUtil.getSize(pageData.yslow.comps),
      'rules': pageData.yslow.g,
      'assets': pageData.yslow.comps,
      'noOfDomains': ySlowUtil.getNumberOfDomains(pageData.yslow.comps),
      'timeSinceLastModificationStats': ySlowUtil.getLastModStats(pageData.yslow.comps),
      'cacheTimeStats': ySlowUtil.getCacheTimeStats(pageData.yslow.comps),
      'noOfAssetsThatIsCached': (pageData.yslow.comps.length - pageData.yslow.g.expiresmod.components.length),
      'assetsPerDomain': ySlowUtil.getAssetsPerDomain(pageData.yslow.comps),
      'assetsPerContentType': ySlowUtil.getAssetsPerContentType(pageData.yslow.comps),
      'sizePerContentType': ySlowUtil.getAssetsSizePerContentType(pageData.yslow.comps),
      'ruleDictionary': pageData.yslow.dictionary.rules
    };
  } else {
    renderData.url = util.getURLFromPageData(pageData);
  }

  renderData.gpsiData = pageData.gpsi;
  renderData.browsertimeData = pageData.browsertime;
  renderData.wptData = pageData.webpagetest;
  if (pageData.phantomjs) {
    renderData.phantomjsData = pageData.phantomjs.getStats();
  }

  renderData.config = this.config;
  renderData.pageMeta = {
    'path': '../',
    'title': 'Page data, collected by sitespeed.io for page ' + url,
    'description': 'All data collected for this individual page.'
  };
  var hash = util.getFileName(url);
  renderHtmlToFile('page', renderData, this.config.run.absResultDir, cb, hash + '.html', 'pages');
};

HTMLRenderer.prototype.renderRules = function(cb) {
  var renderData = {
    'ruleDictionary': ruleDictionary,
    'config': this.config,
    'pageMeta': {
      'title': 'The sitespeed.io rules used by this run',
      'description': '',
      'isRules': true
    }
  };
  renderHtmlToFile('rules', renderData, this.config.run.absResultDir, cb);
};

HTMLRenderer.prototype.renderSites = function(sitesAggregates, cb) {

  var sitesAndAggregates = [];
  var self = this;

  // Add all sites data sorted
  Object.keys(sitesAggregates).forEach(function(site) {
    sitesAndAggregates.push({
      'site': site,
      'aggregates': sitesAggregates[site].filter(function(box) {
        return (self.config.sitesColumns.indexOf(box.id) > -1);
      }).sort(function(box, box2) {
        return self.config.sitesColumns.indexOf(box.id) - self.config.sitesColumns.indexOf(box2.id);
      })
    });
  });
  var renderData = {
    'sitesAndAggregates': sitesAndAggregates,
    'columns': this.config.sitesColumns,
    'config': this.config,
    'columnsMeta': columnsMetaData,
    'ruleDictionary': ruleDictionary,
    'pageMeta': {
      'title': '',
      'description': '',
      'hideMenu': true,
      'isSites': true
    }
  };
  renderHtmlToFile('sites', renderData, this.config.run.absResultDir, cb, 'sites.html', '..');
};


HTMLRenderer.prototype.renderScreenshots = function(pages, cb) {
  var renderData = {
    'pages': pages,
    'config': this.config,
    'pageMeta': {
      'title': '',
      'description': '',
      'isScreenshots': true
    }
  };
  renderHtmlToFile('screenshots', renderData, this.config.run.absResultDir, cb);
};


HTMLRenderer.prototype.renderErrors = function(downloadErrors, analysisErrors, cb) {
  var renderData = {
    'errors': {
      'downloadErrorUrls': downloadErrors,
      'analysisErrorUrls': analysisErrors
    },
    'totalErrors': Object.keys(downloadErrors).length + Object.keys(analysisErrors).length,
    'config': this.config,
    'numberOfPages': this.numberOfAnalyzedPages,
    'pageMeta': {
      'title': 'Pages that couldnt be analyzed',
      'description': 'Here are the pages that couldnt be analyzed by sitespeed.io',
      'isErrors': true
    }
  };
  renderHtmlToFile('errors', renderData, this.config.run.absResultDir, cb);
};

HTMLRenderer.prototype.renderSummary = function(aggregates, cb) {

  var self = this;
  // TODO change to reduce
  var filtered = aggregates.filter(function(box) {
    return (self.config.summaryBoxes.indexOf(box.id) > -1);
  }).sort(function(box, box2) {
    return self.config.summaryBoxes.indexOf(box.id) - self.config.summaryBoxes.indexOf(box2.id);
  });
  var summaryData = {
    'aggregates': filtered,
    'config': this.config,
    'numberOfPages': this.numberOfAnalyzedPages,
    'pageMeta': {
      'title': 'Summary of the sitespeed.io result',
      'description': 'A executive summary.',
      'isSummary': true
    }
  };

  var detailedData = {
    'aggregates': aggregates,
    'config': this.config,
    'numberOfPages': this.numberOfAnalyzedPages,
    'pageMeta': {
      'title': 'In details summary of the sitespeed.io result',
      'description': 'The summary in details.',
      'isDetailedSummary': true
    }
  };

  async.parallel({
      writeSummaryFile: function(callback) {
        renderHtmlToFile('site-summary', summaryData, self.config.run.absResultDir, callback, 'index.html');
      },
      writeDetailedSummaryFile: function(callback) {
        renderHtmlToFile('detailed-site-summary', detailedData, self.config.run.absResultDir, callback);
      }
    },
    function(err, results) {
      cb();
    });
};

HTMLRenderer.prototype.renderPages = function(pages, cb) {
  var renderData = {
    'pages': pages,
    'columnsMeta': columnsMetaData,
    'config': this.config,
    'ruleDictionary': ruleDictionary,
    'numberOfPages': this.numberOfAnalyzedPages,
    'pageMeta': {
      'title': 'All pages information',
      'description': 'All request data, for all the pages',
      'isPages': true
    }
  };

  renderHtmlToFile('pages', renderData, this.config.run.absResultDir, cb);
};

HTMLRenderer.prototype.renderAssets = function(assets, cb) {

  var sorted = assets.sort(function(asset, asset2) {
    return asset2.count - asset.count;
  });

  var renderData = {
    'assets': sorted.length > 200 ? sorted.slice(0, 200) : sorted,
    'config': this.config,
    'numberOfPages': this.numberOfAnalyzedPages,
    'pageMeta': {
      'title': 'The most used assets',
      'description': 'A list of the most used assets for the analyzed pages.',
      'isAssets': true
    }
  };
  renderHtmlToFile('assets', renderData, this.config.run.absResultDir, cb);
};

HTMLRenderer.prototype.renderToplists = function(assets, pages, domains, cb) {

  var limit = 10;

  var assetsBySizeExcludingImages = toplistUtil.getAssetsBySize(assets, limit);
  var largestImages = toplistUtil.getLargestImages(assets, limit);
  var biggestDiffAssets = toplistUtil.getLargestDiffBetweenLastModAndCache(assets, limit);
  var heaviestPages = toplistUtil.getLargestPages(pages, limit);
  var lowestScoringPages = toplistUtil.getLowestScoringPages(pages, limit);

  util.sortWithMaxLength(domains, function(domain, domain2) {
    return domain2.total.stats.max - domain.total.stats.max;
  }, limit);

  var renderData = {
    'largestImages': largestImages,
    'worstCachedAssets': biggestDiffAssets,
    'largestAssets': assetsBySizeExcludingImages,
    // TODO 'slowestAssets': [],
    'slowestDomains': domains,
    'heaviestPages': heaviestPages,
    'lowestScoringPages': lowestScoringPages,
    'config': this.config,
    'numberOfPages': this.numberOfAnalyzedPages,
    'pageMeta': {
      'title': 'The top list page',
      'description': 'A quick way to see which pages and assets are the worst',
      'isToplist': true
    }
  };
  renderHtmlToFile('toplist', renderData, this.config.run.absResultDir, cb);
};


HTMLRenderer.prototype.renderDomains = function(domains, cb) {
  var sorted = domains.sort(function(domain, domain2) {
    return domain2.count - domain.count;
  });

  if (sorted.length > 200) {
    sorted.length = 200;
  }

  var renderData = {
    'domains': sorted,
    'config': this.config,
    'numberOfPages': this.numberOfAnalyzedPages,
    'pageMeta': {
      'title': 'The most domain timings',
      'description': 'A list of the most used domains and the respective timings',
      'isDomains': true
    }
  };
  renderHtmlToFile('domains', renderData, this.config.run.absResultDir, cb);
};


function renderHtmlToFile(template, renderData, absResultDir, cb, fileName, optionalPath) {
  fileName = fileName || (template + '.html');
  optionalPath = optionalPath || '';
  var result = compiledTemplates[template](renderData);
  var file = path.join(absResultDir, optionalPath, fileName);
  fs.outputFile(file, result, function(err) {
    if (err) {
      log.log('error', 'Couldnt write the file ' + file + ' err:' + err);
    } else {
      log.log('info', 'Wrote file ' + fileName);
    }
    cb();
  });
}

function precompileTemplates() {
  compiledTemplates = compileTemplates(path.join(__dirname, '../templates/'));
  compiledPartials = compileTemplates(path.join(__dirname, '../templates/partials/'));

  for (var key in compiledPartials) {
    if (compiledPartials.hasOwnProperty(key)) {
      hb.registerPartial(key, compiledPartials[key]);
    }
  }
}

function compileTemplates(folderPath) {
  // TODO would be cool to do this async
  var templates = {};
  fs.readdirSync(folderPath).forEach(function(file) {
    if (!fs.lstatSync(path.join(folderPath + file)).isDirectory()) {
      templates[path.basename(file, '.hb')] = hb.compile(fs.readFileSync(path.join(folderPath + file), 'utf8'));
    }
  });
  return templates;
}

module.exports = HTMLRenderer;