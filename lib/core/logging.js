import intel from 'intel';

const {
  INFO,
  DEBUG,
  VERBOSE,
  TRACE,
  NONE,
  basicConfig,
  addHandler,
  handlers,
  Formatter
} = intel;

export function configure(options, logDir) {
  options = options || {};

  let level = INFO;

  switch (options.verbose) {
    case 1: {
      level = DEBUG;
      break;
    }
    case 2: {
      level = VERBOSE;
      break;
    }
    case 3: {
      level = TRACE;
      break;
    }
    default: {
      break;
    }
  }

  if (options.silent) {
    level = NONE;
  }

  if (level === INFO) {
    basicConfig({
      format: '[%(date)s] %(levelname)s: %(message)s',
      level: level
    });
  } else {
    basicConfig({
      format: '[%(date)s] %(levelname)s: [%(name)s] %(message)s',
      level: level
    });
  }

  if (options.logToFile) {
    addHandler(
      new handlers.File({
        file: logDir + '/sitespeed.io.log',
        formatter: new Formatter({
          format: '[%(date)s] %(levelname)s: [%(name)s] %(message)s',
          level: level
        })
      })
    );
  }
}
