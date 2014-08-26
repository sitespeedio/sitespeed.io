/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

/** Classic waitFor example from PhantomJS
 */
function waitFor(testFx, onReady, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 10000, //< Default Max Timout is 10s
    start = new Date().getTime(),
    condition = false,
    interval = setInterval(function() {
      if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
        // If not time-out yet and condition not yet fulfilled
        condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
      } else {
        if (!condition) {
          // If condition still not fulfilled (timeout but condition is 'false')
          console.log("'waitFor()' timeout");
          phantom.exit(1);
        } else {
          // Condition fulfilled (timeout and/or condition is 'true')
          typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
          clearInterval(interval); //< Stop this interval
        }
      }
    }, 250); //< repeat check every 250ms
}

var page = require('webpage').create(),
  address, output, w, h, agent, basicauth, auth, headers, fs = require('fs');

if (phantom.args.length < 4 || phantom.args.length > 7) {
  console.log('Usage: phantom.js URL filename width height user-agent headers basic:auth');
  phantom.exit();
} else {
  address = phantom.args[0];
  output = phantom.args[1];
  w = phantom.args[2];
  h = phantom.args[3];
  agent = phantom.args[4];
  headers = phantom.args[5];
  basicauth = phantom.args[6];

  if (basicauth) {
    auth = basicauth.split(':');
    page.settings.userName = auth[0];
    page.settings.password = auth[1];
  }

  if (headers) {
    page.customHeaders = JSON.parse(headers);
  }

  page.viewportSize = {
    width: w,
    height: h
  };

  if (agent) {
    page.settings.userAgent = agent;
  }

  page.open(address, function(status) {
    if (status !== 'success') {
      console.log('Unable to load the address!');
    } else {
      waitFor(function() {
        // Check in the page if a specific element is now visible
        return page.evaluate(function() {
          return (window.performance.timing.loadEventEnd > 0);
        });
      }, function() {
        var timings = page.evaluate(function() {

          var t = window.performance.timing;
          var marks = '';
          try {
            marks = window.performance.getEntriesByType('mark');
          } catch (Error) {

          }

          return {
            navigation: {
              navigationStart: t.navigationStart,
              unloadEventStart: t.unloadEventStart,
              unloadEventEnd: t.unloadEventEnd,
              redirectStart: t.redirectStart,
              redirectEnd: t.redirectEnd,
              fetchStart: t.fetchStart,
              domainLookupStart: t.domainLookupStart,
              domainLookupEnd: t.domainLookupEnd,
              connectStart: t.connectStart,
              connectEnd: t.connectEnd,
              secureConnectionStart: t.secureConnectionStart,
              requestStart: t.requestStart,
              responseStart: t.responseStart,
              responseEnd: t.responseEnd,
              domLoading: t.domLoading,
              domInteractive: t.domInteractive,
              domContentLoadedEventStart: t.domContentLoadedEventStart,
              domContentLoadedEventEnd: t.domContentLoadedEventEnd,
              domComplete: t.domComplete,
              loadEventStart: t.loadEventStart,
              loadEventEnd: t.loadEventEnd
            },
            timings: {
              domainLookupTime: (t.domainLookupEnd - t.domainLookupStart),
              redirectionTime: (t.fetchStart - t.navigationStart),
              serverConnectionTime: (t.connectEnd - t.requestStart),
              serverResponseTime: (t.responseEnd - t.responseStart),
              pageDownloadTime: (t.domInteractive - t.navigationStart),
              domInteractiveTime: (t.domContentLoadedEventStart - t.navigationStart),
              pageLoadTime: (t.loadEventStart - t.navigationStart),
              frontEndTime: (t.loadEventStart - t.responseEnd),
              backEndTime: (t.responseStart - t.navigationStart)
            },
            userTimings: {
              marks: marks
            }
          };

        });

        timings.url = page.url;
        try {
          fs.write(output, JSON.stringify(timings), 'w');
        } catch (e) {
          console.log(e);
        }
        phantom.exit();
      });
    }
  });
}
