/**
 * Sitespeed.io - How speedy is your site? (https://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

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
address, output, w, h, agent, full, basicauth, auth, headers;


if (system.args.length < 6 || system.args.length > 10) {
  console.log('Usage: screenshot.js URL filename width height user-agent full headers basic:auth waitscript');
  phantom.exit();
} else {
  address = system.args[1];
  output = system.args[2];
  w = system.args[3];
  h = system.args[4];
  agent = system.args[5];
  full = system.args[6];
  headers = system.args[7];
  basicauth = system.args[8];
  waitScript = new Function(system.args[9]);

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
  page.settings.userAgent = agent;

  page.onConsoleMessage = function (msg) {
  };
  page.onError = function (msg) {
  };

  page.open(address, function(status) {
    if (status !== 'success') {
      console.log('Unable to load the address!');
    } else {
      waitFor(function() {
        return page.evaluate(eval(waitScript));
      }, function() {

        if (full !== 'true') {
          page.clipRect = {
            left: 0,
            top: 0,
            width: w,
            height: h
          };
        }
        page.render(output);
        phantom.exit();
      });
    }
  });
}
