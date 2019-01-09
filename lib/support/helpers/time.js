'use strict';

const plural = require('./plural');

module.exports = {
  duration(seconds) {
    if (seconds === undefined) {
      return '';
    }

    const secondsPerYear = 365 * 24 * 60 * 60,
      secondsPerWeek = 60 * 60 * 24 * 7,
      secondsPerDay = 60 * 60 * 24,
      secondsPerHour = 60 * 60,
      secondsPerMinute = 60,
      sign = seconds < 0 ? '-' : '';

    if (seconds < 0) {
      seconds = Math.abs(seconds);
    }

    if (seconds / secondsPerYear >= 1) {
      return sign + plural(Math.round(seconds / secondsPerYear), ' year');
    } else if (seconds / secondsPerWeek >= 1) {
      return sign + plural(Math.round(seconds / secondsPerWeek), ' week');
    } else if (seconds / secondsPerDay >= 1) {
      return sign + plural(Math.round(seconds / secondsPerDay), ' day');
    } else if (seconds / secondsPerHour >= 1) {
      return sign + plural(Math.round(seconds / secondsPerHour), ' hour');
    } else if (seconds / secondsPerMinute >= 1) {
      return sign + plural(Math.round(seconds / secondsPerMinute), ' minute');
    } else {
      return sign + plural(seconds, ' second');
    }
  },
  ms(ms) {
    if (ms < 1000) {
      return ms + ' ms';
    } else {
      return Number(ms / 1000).toFixed(3) + ' s';
    }
  }
};
