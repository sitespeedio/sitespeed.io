'use strict';

let log = require('intel');

module.exports.configure = function configure(options, logDir) {
  options = options || {};

  let level = log.INFO;
  switch (options.verbose) {
    case 1:
      level = log.DEBUG;
      break;
    case 2:
      level = log.VERBOSE;
      break;
    case 3:
      level = log.TRACE;
      break;
    default:
      break;
  }

  if (options.silent) {
    level = log.NONE;
  }

  log.basicConfig({
    'format': '[%(date)s] %(message)s',
    'level': level
  });

  log.addHandler(new log.handlers.File(logDir + '/sitespeed.io.log'));
};
