'use strict';

const moment = require('moment');

module.exports = {
  duration(seconds) {
    return moment.duration(seconds * 1000).humanize();
  }
};
