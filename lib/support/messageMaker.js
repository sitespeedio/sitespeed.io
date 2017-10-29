'use strict';

const moment = require('moment'),
  makeUuid = require('uuid').v4;

module.exports = function messageMaker(source) {
  return {
    make(type, data, extras) {
      const timestamp = moment().format(),
        uuid = makeUuid();

      return Object.assign({ uuid, type, timestamp, source, data }, extras);
    }
  };
};
