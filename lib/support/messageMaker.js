'use strict';

const moment = require('moment'),
  merge = require('lodash.merge'),
  makeUuid = require('uuid').v4;

module.exports = function messageMaker(source) {
  return {
    make(type, data, extras) {
      const timestamp = moment().format(),
        uuid = makeUuid();

      return merge({ uuid, type, timestamp, source, data }, extras);
    }
  };
};
