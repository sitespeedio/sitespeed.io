/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

if (!Date.prototype.toISOString) {
  Date.prototype.toISOString = function() {
    function pad(n) {
      return n < 10 ? '0' + n : n;
    }

    function ms(n) {
      return n < 10 ? '00' + n : n < 100 ? '0' + n : n
    }
    return this.getFullYear() + '-' +
      pad(this.getMonth() + 1) + '-' +
      pad(this.getDate()) + 'T' +
      pad(this.getHours()) + ':' +
      pad(this.getMinutes()) + ':' +
      pad(this.getSeconds()) + '.' +
      ms(this.getMilliseconds()) + 'Z';
  }
}

function createHAR(address, title, startTime, onContentLoad, onLoad, resources) {
  var entries = [];

  resources.forEach(function(resource) {
    var request = resource.request,
      startReply = resource.startReply,
      endReply = resource.endReply;

    if (!request || !startReply || !endReply) {
      return;
    }

    // Exclude Data URI from HAR file because
    // they aren't included in specification
    if (request.url.match(/(^data:image\/.*)/i)) {
      return;
    }

    entries.push({
      startedDateTime: request.time.toISOString(),
      time: endReply.time - request.time,
      request: {
        method: request.method,
        url: request.url,
        httpVersion: "HTTP/1.1",
        cookies: [],
        headers: request.headers,
        queryString: [],
        headersSize: -1,
        bodySize: -1
      },
      response: {
        status: endReply.status,
        statusText: endReply.statusText,
        httpVersion: "HTTP/1.1",
        cookies: [],
        headers: endReply.headers,
        redirectURL: "",
        headersSize: -1,
        bodySize: startReply.bodySize,
        content: {
          size: startReply.bodySize,
          mimeType: endReply.contentType
        }
      },
      cache: {},
      timings: {
        blocked: 0,
        dns: -1,
        connect: -1,
        send: 0,
        wait: startReply.time - request.time,
        receive: endReply.time - startReply.time,
        ssl: -1
      },
      pageref: address
    });
  });

  return {
    log: {
      version: '1.2',
      creator: {
        name: "PhantomJS",
        version: phantom.version.major + '.' + phantom.version.minor +
          '.' + phantom.version.patch
      },
      pages: [{
        startedDateTime: startTime.toISOString(),
        id: address,
        title: title,
        pageTimings: {
          onContentLoad: onContentLoad,
          onLoad: onLoad
        }
      }],
      entries: entries
    }
  };
}

/** Classic waitFor example from PhantomJS
 */
function waitFor(testFx, onReady, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 60000, //< Default Max Timout is 60s
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
system = require('system'),
  address, output, harfilename, w, h, agent, basicauth, auth, headers, waitScript, fs = require('fs');

if (system.args.length < 7 || system.args.length > 10) {
  console.log('Usage: phantom.js URL filename harfilename width height user-agent headers basic:auth');
  phantom.exit();
} else {
  address = system.args[1];
  output = system.args[2];
  harfilename = system.args[3];
  w = system.args[4];
  h = system.args[5];
  agent = system.args[6];
  waitScript = new Function(system.args[7]),
  headers = system.args[8];
  basicauth = system.args[9];

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

  page.resources = [];

  page.onLoadStarted = function() {
    page.startTime = new Date();
  };

  page.onResourceRequested = function(req) {
    page.resources[req.id] = {
      request: req,
      startReply: null,
      endReply: null
    };
  };

  page.onResourceReceived = function(res) {
    if (res.stage === 'start') {
      page.resources[res.id].startReply = res;
    }
    if (res.stage === 'end') {
      page.resources[res.id].endReply = res;
    }
  };

  page.open(address, function(status) {
    if (status !== 'success') {
      console.log('Unable to load the address!');
    } else {
      page.endTime = new Date();
      page.title = page.evaluate(function() {
        return document.title;
      });

      waitFor(function() {
        // Check in the page if a specific element is now visible
        return page.evaluate(eval(waitScript));
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
              serverResponseTime: (t.responseEnd - t.requestStart),
              pageDownloadTime: (t.responseEnd - t.responseStart),
              domInteractiveTime: (t.domInteractive - t.navigationStart),
              domContentLoadedTime: (t.domContentLoadedEventStart - t.navigationStart),
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

        har = createHAR(page.url, page.title, page.startTime, timings.timings.domContentLoadedTime, timings.timings
          .pageLoadTime, page.resources);

        try {
          fs.write(output, JSON.stringify(timings), 'w');
          fs.write(harfilename, JSON.stringify(har, undefined, 4), 'w');

        } catch (e) {
          console.log(e);
        }
        phantom.exit();
      });
    }
  });
}
