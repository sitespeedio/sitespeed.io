#!/usr/bin/env node

var Sitespeed = require('../lib/sitespeed'),
  config = require('../lib/cli');

var sitespeed = new Sitespeed();

require('whereis')('java', function searched(err) {
  // yep, we still need Java for the crawler & browsertime
  if (err) {
    console.error(
      'Could not find Java, make sure it is installed in your $PATH');
  } else {
    sitespeed.run(config, function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      else {
      }
    });
  }
});
