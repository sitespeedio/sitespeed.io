import intel from 'intel';
import { createWriteStream } from 'node:fs';
import { inherits } from 'node:util';
const {
  INFO,
  DEBUG,
  VERBOSE,
  TRACE,
  NONE,
  basicConfig,
  Logger,
  Handler,
  Formatter
} = intel;

// FileHandler isn't exposed in Intel when we moved to ESM.
// To fix that for now we just use the same code as Intel.

function StreamHandler(options) {
  options = options || {};
  if (!options.stream) {
    options = { stream: options };
  }
  Handler.call(this, options);
  this._stream = options.stream;
}

inherits(StreamHandler, Handler);

StreamHandler.prototype.emit = function streamEmit(record) {
  this._stream.write(this.format(record) + '\n');
};

function FileHandler(options) {
  if (typeof options === 'string') {
    options = { file: options };
  }
  this._file = options.file;

  options.stream = this._open();
  StreamHandler.call(this, options);
}
inherits(FileHandler, StreamHandler);

FileHandler.prototype._open = function open() {
  return createWriteStream(this._file, { flags: 'a' });
};

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
    let logger = new Logger();
    logger.addHandler(
      new FileHandler({
        file: logDir + '/sitespeed.io.log',
        formatter: new Formatter({
          format: '[%(date)s] %(levelname)s: [%(name)s] %(message)s',
          level: level
        })
      })
    );
  }
}
