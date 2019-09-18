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

  if (level === log.INFO) {
    log.basicConfig({
      format: '[%(date)s] %(levelname)s: %(message)s',
      level: level
    });
  } else {
    log.basicConfig({
      format: '[%(date)s] %(levelname)s: [%(name)s] %(message)s',
      level: level
    });
  }

  if (options.logToFile) {
    log.addHandler(
      new log.handlers.File({
        file: logDir + '/sitespeed.io.log',
        formatter: new log.Formatter({
          format: '[%(date)s] %(levelname)s: [%(name)s] %(message)s',
          level: level
        })
      })
    );
  }
};
