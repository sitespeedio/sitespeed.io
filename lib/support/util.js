'use strict';

const format = require('util').format;

module.exports = {
  toArray(arrayLike) {
    if (arrayLike === undefined || arrayLike === null) {
      return [];
    }
    if (Array.isArray(arrayLike)) {
      return arrayLike;
    }
    return [arrayLike];
  },
  throwIfMissing(options, keys, namespace) {
    let missingKeys = keys.filter(key => !options[key]);
    if (missingKeys.length > 0) {
      throw new Error(
        format(
          'Required option(s) %s need to be specified in namespace "%s"',
          missingKeys.map(s => '"' + s + '"'),
          namespace
        )
      );
    }
  }
};
