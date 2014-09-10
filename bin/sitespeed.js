#!/usr/bin/env node
var Sitespeed = require('../lib/sitespeed'),
config = require('../lib/conf');

var sitespeed = new Sitespeed(config);

require('whereis')('java', function searched(err) {
  // yep, we still need Java for the crawler & browsertime
  if (err) {
    console.error(
      'Could not find Java, make sure it is installed in your $PATH');
  }
  else {
    sitespeed.run(function() {
      // TODO this is only used to check that everything is ok
      console.log('Finished callback');
    });
  }
});
