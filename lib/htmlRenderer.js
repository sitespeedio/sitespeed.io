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
    config = require('./conf'),
    helpers = require('./hb-helpers'),
    columnsMetaData = require('../conf/columnsMetaData.json'),
    async = require("async"),
    util = require('./util');

module.exports = HTMLRenderer;

var compiledTemplates = {},
    compiledPartials = {},
    ruleDictionary = {};

function HTMLRenderer() {
    this.numberOfAnalyzedPages = 0;
    precompileTemplates();
    helpers.registerHelpers();
    copyAssets();
}

function copyAssets() {
  fs.copy(path.join(__dirname, '../assets/'), config.run.absResultDir, function (err) {
      if (err) throw err;
  });
}

HTMLRenderer.prototype.renderPage = function (url, pageData, cb) {
    this.numberOfAnalyzedPages++;

    var renderData = {};
    if (pageData.yslow) {
      renderData = {
          "url": pageData.yslow.originalUrl,
          "score": pageData.yslow.o,
          "size": util.getSize(pageData.yslow.comps),
          "rules": pageData.yslow.g,
          "assets": pageData.yslow.comps,
          "noOfDomains": util.getNumberOfDomains(pageData.yslow.comps),
          "timeSinceLastModificationStats": util.getLastModStats(pageData.yslow.comps),
          "cacheTimeStats": util.getCacheTimeStats(pageData.yslow.comps),
          "noOfAssetsThatIsCached": (pageData.yslow.comps.length - pageData.yslow.g.expiresmod.components.length),
          "assetsPerDomain": util.getAssetsPerDomain(pageData.yslow.comps),
          "assetsPerContentType": util.getAssetsPerContentType(pageData.yslow.comps),
          "sizePerContentType": util.getAssetsSizePerContentType(pageData.yslow.comps),
          "ruleDictionary": pageData.yslow.dictionary.rules,
      };
    }
    else {
      renderData.url = util.getURLFromPageData(pageData);
    }

    renderData.gpsiData = pageData.gpsi;
    renderData.browsertimeData = pageData.browsertime;
    renderData.wptData = pageData.webpagetest;
    renderData.config = config;
    renderData.pageMeta = {
      "path": "../",
      "title": "Page data, collected by sitespeed.io for page " + url,
      "description": "All data collected for this individual page."
    };
    var hash = util.getUrlHash(url);
    renderHtmlToFile('page', renderData, cb, hash + '.html', 'pages');
};

HTMLRenderer.prototype.renderRules = function (cb) {
  var renderData = {
    "ruleDictionary": ruleDictionary,
    "config": config,
    "pageMeta": {
      "title": "The sitespeed.io rules used by this run",
      "description": "",
      "isRules": true
    }
  };
renderHtmlToFile('rules', renderData, cb);
};

HTMLRenderer.prototype.renderScreenshots = function (pages, cb) {
  var renderData = {
    "pages": pages,
    "config": config,
    "pageMeta": {
      "title": "",
      "description": "",
      "isScreenshots": true
    }
  };
renderHtmlToFile('screenshots', renderData, cb);
};


HTMLRenderer.prototype.renderErrors = function (downloadErrors, analysisErrors, cb) {
  var renderData = {
    "errors": {
        "downloadErrorUrls": downloadErrors,
        "analysisErrorUrls": analysisErrors
    },
    "totalErrors": Object.keys(downloadErrors).length + Object.keys(analysisErrors).length ,
    "config": config,
    "numberOfPages":this.numberOfAnalyzedPages,
    "pageMeta": {
      "title": "Pages that couldn't be analyzed",
      "description": "Here are the pages that couldn't be analyzed by sitespeed.io",
      "isErrors": true
    }
};
renderHtmlToFile('errors', renderData, cb);
};

HTMLRenderer.prototype.renderSummary = function(aggregates, cb) {
  // TODO change to reduce
  var filtered = aggregates.filter(function(box) {
    return (config.summaryBoxes.indexOf(box.id) > -1);
  }).sort(function(box, box2) {
    return config.summaryBoxes.indexOf(box.id) - config.summaryBoxes.indexOf(box2.id);
  });
  var summaryData = {
    "aggregates": filtered,
    "config": config,
    "numberOfPages": this.numberOfAnalyzedPages,
    "pageMeta": {
      "title": "Summary of the sitespeed.io result",
      "description": "A executive summary.",
      "isSummary": true
    }
  };

  var detailedData = {
    "aggregates": aggregates,
    "config": config,
    "numberOfPages": this.numberOfAnalyzedPages,
    "pageMeta": {
      "title": "In details summary of the sitespeed.io result",
      "description": "The summary in details.",
      "isDetailedSummary": true
    }
  };

  async.parallel({
      writeSummaryFile: function(callback) {
        renderHtmlToFile('site-summary', summaryData, callback, 'index.html');
      },
      writeDetailedSummaryFile: function(callback) {
        renderHtmlToFile('detailed-site-summary', detailedData, callback);
      }
    },
    function(err, results) {
      cb();
    });
};

HTMLRenderer.prototype.renderPages = function (pages, cb) {
    var renderData = {
        "pages": pages,
        "columnsMeta": columnsMetaData,
        "config": config,
        "ruleDictionary": ruleDictionary,
        "numberOfPages":this.numberOfAnalyzedPages,
        "pageMeta": {
          "title": "All pages information",
          "description": "All request data, for all the pages",
          "isPages": true
        }
    };

    renderHtmlToFile('pages', renderData, cb);
};

HTMLRenderer.prototype.renderAssets = function (assets, cb) {
    var sorted = assets.sort(function(asset, asset2) {
      return asset2.count - asset.count;
    });

    if (sorted.length>200)
      sorted.length = 200;

    var renderData = {
        "assets": sorted,
        "config": config,
        "numberOfPages":this.numberOfAnalyzedPages,
        "pageMeta": {
          "title": "The most used assets",
          "description": "A list of the most used assets for the analyzed pages.",
          "isAssets": true
        }
    };
    renderHtmlToFile('assets', renderData, cb);
};

function renderHtmlToFile(template, renderData, cb, fileName, optionalPath) {
    fileName = fileName || (template + ".html");
    optionalPath = optionalPath || '';
    var result = compiledTemplates[template](renderData);
    var file = path.join(config.run.absResultDir, optionalPath, fileName);
    fs.outputFile(file, result, function(err) {
      if (err)
        log.log('error', "Couldn't write the file " + file + ' err:' + err);
      else
        log.log('info', "Wrote file " + fileName); 
      cb();
    });
}

function precompileTemplates() {
    compiledTemplates = compileTemplates(path.join(__dirname, "../templates/"));
    compiledPartials = compileTemplates(path.join(__dirname, "../templates/partials/"));

    for (var key in compiledPartials) {
        hb.registerPartial(key, compiledPartials[key]);
    }
}

function compileTemplates(folderPath) {
    var templates = {};
    fs.readdirSync(folderPath).forEach(function (file) {
        if (!fs.lstatSync(path.join(folderPath + file)).isDirectory())
          templates[path.basename(file, '.hb')] = hb.compile(fs.readFileSync(path.join(folderPath + file), 'utf8'));
    });
    return templates;
}
