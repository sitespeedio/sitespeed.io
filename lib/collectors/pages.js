/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var util = require('../util/util'),
  yslowUtil = require('../util/yslowUtil');

var pages = [];
var isDoc = function(comp) {
  return (comp.type === 'doc');
};

exports.processPage = function(pageData) {

  var p = {};

  if (pageData.yslow) {
    p = collectYSlowMetrics(pageData, p);
    collectYSlowRules(pageData, p);
  }

  if (pageData.gpsi) {
    collectGPSI(pageData, p);
  }

  if (pageData.browsertime) {
    collectBrowserTime(pageData, p);
  }
  if (pageData.webpagetest) {
    collectWPT(pageData, p);
  }
  if (pageData.phantomjs) {
    collectPhantomJS(pageData, p);
  }

  p.url = util.getURLFromPageData(pageData);

  // TODO fix a cleaner check for this
  // if an analyzed failed, skip it
  if (p.url !== 'undefined') {
    pages.push(p);
  }

};

function collectYSlowMetrics(pageData, p) {

  var docs = pageData.yslow.comps.filter(isDoc);

  var assetTypes = ['js', 'css', 'image', 'cssimage', 'font', 'flash', 'iframe','doc'];

  docs.forEach(function(doc) {
    p = {
      score: pageData.yslow.o,
      // strip to only store response headers to save space?
      headers: doc.headers,
      yslow: {
        requests: {
          'v': pageData.yslow.comps.length,
          'unit': ''
        },
        requestsMissingExpire: {
          'v': pageData.yslow.comps.filter(function(c) {
            return yslowUtil.getCacheTime(c) === 0;
          }).length,
          'unit': ''
        },
        timeSinceLastModification: {
          'v': yslowUtil.getTimeSinceLastMod(doc),
          'unit': 'seconds'
        },
        cacheTime: {
          'v': yslowUtil.getCacheTime(doc),
          'unit': 'seconds'
        },
        docWeight: {
          'v': doc.size,
          'unit': 'bytes'
        },
        pageWeight: {
          'v': yslowUtil.getSize(pageData.yslow.comps),
          'unit': 'bytes'
        }
      }
    };
    p.yslow.assets = {};
    assetTypes.forEach(function(asset) {
      p.yslow.assets[asset] = {
        'v': pageData.yslow.comps.filter(function(c) {
          return c.type === asset;
        }).length,
        'unit': ''
      };
      p.yslow.assets[asset + 'Weight'] = {
        'v': yslowUtil.getSize(pageData.yslow.comps.filter(function(c) {
          return c.type === asset;
        })),
        'unit': 'bytes'
      };
    });
  });
  return p;
}


function collectYSlowRules(pageData, p) {
  p.rules = {};
  // add all rule scores as fields
  Object.keys(pageData.yslow.g).forEach(function(rule) {
    p.rules[rule] = {
      'v': pageData.yslow.g[rule].score,
      'unit': ''
    };
    // TODO how should we name them
    p.rules[rule].items = {
      'v': pageData.yslow.g[rule].components.length,
      'unit': ''
    };
  });
}

function collectGPSI(pageData, p) {
  p.gpsi = {};
  p.gpsi.gscore = {
    'v': pageData.gpsi.score,
    'unit': ''
  };
}

function collectPhantomJS(pageData, p) {
  var timingsWeWillPush = ['min', 'mean', 'median', 'p90', 'p99', 'max'];
  p.phantomjs = {};
  pageData.phantomjs.getStats().forEach(function(timing) {
    p.phantomjs[timing.id] = {};
    timingsWeWillPush.forEach(function(number) {
      p.phantomjs[timing.id][number] = {
        'v': timing.stats[number],
        'unit': 'milliseconds'
      };
    });
  });
}


function collectWPT(pageData, p) {
  p.wpt = {};

  // here's the data that we will collect from WPT
  var views = ['firstView'];
  if (pageData.webpagetest.wpt.response.data.median.repeatView) {
    views.push('repeatView');
  }

  var sizes = ['image_savings', 'image_total', 'bytesIn', 'bytesInDoc'];
  var timings = ['SpeedIndex', 'firstPaint', 'TTFB', 'visualComplete', 'domContentLoadedEventEnd', 'loadTime'];
  var others = ['requests'];

  views.forEach(function(view) {
    p.wpt[view] = {};
    sizes.forEach(function(size) {
      p.wpt[view][size] = {
        'v': pageData.webpagetest.wpt.response.data.median[view][size],
        'unit': 'bytes'
      };
    });
    timings.forEach(function(timing) {
      p.wpt[view][timing] = {
        'v': pageData.webpagetest.wpt.response.data.median[view][timing],
        'unit': 'milliseconds'
      };
    });

    // also fetch all user timings!
    var userTimings = pageData.webpagetest.wpt.response.data.median[view].userTimes;
    if (userTimings) {
      Object.keys(userTimings).forEach(function(userTiming) {
        p.wpt[view][userTiming] = {
          'v': pageData.webpagetest.wpt.response.data.median[view].userTimes[userTiming],
          'unit': 'milliseconds'
        };
      });
    }

    others.forEach(function(metric) {
      p.wpt[view][metric] = {
        'v': pageData.webpagetest.wpt.response.data.median[view][metric],
        'unit': ''
      };
    });

  });
}

function collectBrowserTime(pageData, p) {
  p.timings = {};

  var timingsWeWillPush = ['min', 'mean', 'median', 'p90', 'p99', 'max'];

  pageData.browsertime.browsertime.forEach(function(runPerBrowser) {
    var browser = runPerBrowser.browserName;
    p.timings[browser] = {};
    runPerBrowser.statistics.forEach(function(stats) {
      p.timings[browser][stats.name] = {};
      p.timings[stats.name] = {};
      timingsWeWillPush.forEach(function(number) {
        p.timings[browser][stats.name][number] = {
          'v': stats[number],
          'unit': 'milliseconds'
        };
        p.timings[stats.name][number] = {
          'v': stats[number],
          'unit': 'milliseconds'
        };
      });
    });
  });
}

exports.generateResults = function() {
  return {
    id: 'pages',
    list: pages
  };
};

exports.clear = function() {
  pages = [];
};
