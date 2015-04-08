/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

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
    collectHAR(pageData, p);
  }
  if (pageData.webpagetest) {
    collectWPT(pageData, p);
    collectHAR(pageData, p);
  }
  if (pageData.headless) {
    collectHeadlessData(pageData, p);
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

  var assetTypes = ['js', 'css', 'image', 'cssimage', 'font', 'flash', 'iframe', 'doc'];

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

function collectHeadlessData(pageData, p) {
  var timingsWeWillPush = ['min', 'mean', 'median', 'p90', 'p99', 'max'];
  p.headless = {};
  pageData.headless.getStats().forEach(function(timing) {
    p.headless[timing.id] = {};
    timingsWeWillPush.forEach(function(number) {
      p.headless[timing.id][number] = {
        'v': timing.stats[number],
        'unit': 'milliseconds'
      };
    });
  });
}


function collectHAR(pageData, p) {
  p.har = [];
  if (pageData.browsertime) {
    Array.prototype.push.apply(p.har, pageData.browsertime.har);
  }
  else if (pageData.webpagetest) {
    Array.prototype.push.apply(p.har, pageData.webpagetest.har);
  }
}

function collectWPT(pageData, p) {
  p.wpt = {};

  // the views we will test, we will add the repeated view later if we have it
  var views = ['firstView'];

  // the different kind of data that we will fetch from WPT and add to the page
  var sizes = ['image_savings', 'image_total', 'bytesIn', 'bytesInDoc'];
  var timings = ['SpeedIndex', 'firstPaint', 'render', 'TTFB', 'visualComplete', 'domContentLoadedEventEnd',
    'loadTime'
  ];
  var others = ['requests'];

  // for all browsers/locations and connections
  pageData.webpagetest.wpt.forEach(function(browserAndLocation) {

    var connectivity = browserAndLocation.response.data.connectivity.toLowerCase();
    var locationAndBrowser = browserAndLocation.response.data.location.split(':');
    var location = locationAndBrowser[0].toLowerCase();
    var browser = locationAndBrowser[1].toLowerCase();

    // if we don't have it, setup a clean object
    p.wpt[location] = p.wpt[location] || {};
    p.wpt[location][browser] = p.wpt[location][browser] || {};
    p.wpt[location][browser][connectivity] = p.wpt[location][browser][connectivity] || {};

    // only collect repeat view when we have the data
    if (browserAndLocation.response.data.median.repeatView) {
      views.push('repeatView');
    }

    views.forEach(function(view) {
      p.wpt[location][browser][connectivity][view] = {};
      sizes.forEach(function(size) {
        p.wpt[location][browser][connectivity][view][size] = {
          'v': browserAndLocation.response.data.median[view][size],
          'unit': 'bytes'
        };
      });
      timings.forEach(function(timing) {
        p.wpt[location][browser][connectivity][view][timing] = {
          'v': browserAndLocation.response.data.median[view][timing],
          'unit': 'milliseconds'
        };
      });

      // also fetch all user timings!
      var userTimings = browserAndLocation.response.data.median[view].userTimes;
      if (userTimings) {
        Object.keys(userTimings).forEach(function(userTiming) {
          p.wpt[location][browser][connectivity][view][userTiming] = {
            'v': browserAndLocation.response.data.median[view].userTimes[userTiming],
            'unit': 'milliseconds'
          };
        });
      }

      others.forEach(function(metric) {
        p.wpt[location][browser][connectivity][view][metric] = {
          'v': browserAndLocation.response.data.median[view][metric],
          'unit': ''
        };
      });

    });

  });

}

function collectBrowserTime(pageData, p) {

  var types = ['default', 'custom'];

  var statsWeWillPush = ['min', 'mean', 'median', 'p90', 'p99', 'max'];
  p.timings = {};
  p.extras = {};
  p.custom = {};

  types.forEach(function(type) {

    pageData.browsertime.browsertime.forEach(function(runPerBrowser) {
      var browser = runPerBrowser.browserName;
      p.timings[browser] = p.timings[browser] || {};
      p.extras[browser] = p.extras[browser] || {};
      p.custom[browser] = p.custom[browser] || {};

      for (var stats in runPerBrowser[type].statistics) {
        var a = p.custom;
        if (type === 'default') {

          // if it is a timing
          if (stats.indexOf('Time') > -1 || stats === 'speedIndex' || stats === 'firstPaint') {
            a = p.timings;
          } else {
            a = p.extras;
          }
        }
        a[browser][stats] = {};
        a[stats] = {};
				for (var number in statsWeWillPush) {
          a[browser][stats][statsWeWillPush[number]] = {
            'v': runPerBrowser[type].statistics[stats][statsWeWillPush[number]],
            'unit': 'milliseconds'
          };
          a[stats][statsWeWillPush[number]] = {
            'v': runPerBrowser[type].statistics[stats][statsWeWillPush[number]],
            'unit': 'milliseconds'
          };
        }
      }
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
