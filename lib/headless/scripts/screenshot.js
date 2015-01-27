/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var page = require('webpage').create(),
system = require('system'),
address, output, w, h, agent, full, basicauth, auth, headers;


if (system.args.length < 6 || system.args.length > 9) {
  console.log('Usage: screenshot.js URL filename width height user-agent full headers basic:auth');
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
  page.open(address, function(status) {
    if (status !== 'success') {
      console.log('Unable to load the address!');
    } else {
      window.setTimeout(function() {

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
      }, 200);
    }
  });
}
