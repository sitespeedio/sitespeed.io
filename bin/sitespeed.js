#!/usr/bin/env node
var Runner = require("../lib/runner");

var r = new Runner();

require('whereis')('java', function searched(err) {
  if (err) {
    return console.error(
      'Could not find java, make sure it is installed in your $PATH');
  }
});

r.run();
