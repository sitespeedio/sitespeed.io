'use strict';

const moment = require('moment'),
  merge = require('lodash.merge');

module.exports = function messageMaker(source) {
  return {
    make(type, data, extras) {
      const timestamp = moment().format();
      return merge({type, timestamp, source, data}, extras);
    }
  };
};
