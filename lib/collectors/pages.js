/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var util = require('../util');
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

  p.url = util.getURLFromPageData(pageData);

  // TODO fix a cleaner check for this
  // if an analyzed failed, skip it
  if (p.url !== 'undefined') {
    pages.push(p);
  }

};

function collectYSlowMetrics(pageData, p) {

  var docs = pageData.yslow.comps.filter(isDoc);

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
            return util.getCacheTime(c) === 0;
          }).length,
          'unit': ''
        },
        timeSinceLastModification: {
          'v': util.getTimeSinceLastMod(doc),
          'unit': 'seconds'
        },
        cacheTime: {
          'v': util.getCacheTime(doc),
          'unit': 'seconds'
        },
        docWeight: {
          'v': doc.size,
          'unit': 'bytes'
        },
        pageWeight: {
          'v': util.getSize(pageData.yslow.comps),
          'unit': 'bytes'
        },
        assets: {
          js: {
            'v': pageData.yslow.comps.filter(function(c) {
              return c.type === 'js';
            }).length,
            'unit': ''
          },
          css: {
            'v': pageData.yslow.comps.filter(function(c) {
              return c.type === 'css';
            }).length,
            'unit': ''
          },
          img: {
            'v': pageData.yslow.comps.filter(function(c) {
              return c.type === 'image';
            }).length,
            'unit': ''
          },
          cssimg: {
            'v': pageData.yslow.comps.filter(function(c) {
              return c.type === 'cssimage';
            }).length,
            'unit': ''
          },
          font: {
            'v': pageData.yslow.comps.filter(function(c) {
              return c.type === 'font';
            }).length,
            'unit': ''
          },
          flash: {
            'v': pageData.yslow.comps.filter(function(c) {
              return c.type === 'flash';
            }).length,
            'unit': ''
          },
          iframe: {
            'v': pageData.yslow.comps.filter(function(c) {
              return c.type === 'iframe';
            }).length,
            'unit': ''
          },
          jsWeight: {
            'v': util.getSize(pageData.yslow.comps.filter(function(c) {
              return c.type === 'js';
            })),
            'unit': 'bytes'
          },
          cssWeight: {
            'v': util.getSize(pageData.yslow.comps.filter(function(c) {
              return c.type === 'css';
            })),
            'unit': 'bytes'
          },
          imgWeight: {
            'v': util.getSize(pageData.yslow.comps.filter(function(c) {
              return c.type === 'img';
            })),
            'unit': 'bytes'
          },
          fontWeight: {
            'v': util.getSize(pageData.yslow.comps.filter(function(c) {
              return c.type === 'font';
            })),
            'unit': 'bytes'
          },
          flashWeight: {
            'v': util.getSize(pageData.yslow.comps.filter(function(c) {
              return c.type === 'flash';
            })),
            'unit': 'bytes'
          }
        }
      }
    };

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

function collectWPT(pageData, p) {
  p.wpt = {};
  p.wpt.speedIndex = {
    'v': pageData.webpagetest.response.data.median.firstView.SpeedIndex,
    'unit': ''
  };

  p.wpt.imageSavings = {
    'v': pageData.webpagetest.response.data.median.firstView.image_savings, // jshint ignore:line
    'unit': 'bytes'
  };

  p.wpt.imageTotal = {
    'v': pageData.webpagetest.response.data.median.firstView.image_total, // jshint ignore:line
    'unit': 'bytes'
  };

  p.wpt.firstViewFirstPaint = {
    'v': pageData.webpagetest.response.data.median.firstView.firstPaint,
    'unit': 'milliseconds'
  };

}

function collectBrowserTime(pageData, p) {
  p.timings = {};

  var timingsWeWillPush = ['min', 'mean', 'median', 'p90', 'p99', 'max'];

  pageData.browsertime.forEach(function (runPerBrowser) {
    var browser = runPerBrowser.pageData.browserName;
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
