#!/usr/bin/env node
var Runner = require('../lib/runner'),
config = require('../lib/conf');

var r = new Runner(config);

require('whereis')('java', function searched(err) {
  // yep, we still need Java for the crawler & browsertime
  if (err) {
    console.error(
      'Could not find Java, make sure it is installed in your $PATH');
  }
  else {
    r.run(function() {
      // TODO this is only used to check that everything is ok
      console.log('Finished callback');
    });
  }
});
