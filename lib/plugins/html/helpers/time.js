'use strict';

module.exports = {
  duration(seconds) {
    if (seconds === undefined) {
      return '';
    }

    var secondsPerYear = 365 * 24 * 60 * 60,
      secondsPerWeek = 60 * 60 * 24 * 7,
      secondsPerDay = 60 * 60 * 24,
      secondsPerHour = 60 * 60,
      secondsPerMinute = 60,
      sign = (seconds < 0) ? '-' : '';

    if (seconds < 0) {
      seconds = Math.abs(seconds);
    }

    if (seconds / secondsPerYear >= 1) {
      return sign + Math.round(seconds / secondsPerYear) + ' year' + ((Math.round(
          seconds / secondsPerYear) > 1) ? 's' : '');
    } else if (seconds / secondsPerWeek >= 1) {
      return sign + Math.round(seconds / secondsPerWeek) + ' week' + ((Math.round(
          seconds / secondsPerWeek) > 1) ? 's' : '');
    } else if (seconds / secondsPerDay >= 1) {
      return sign + Math.round(seconds / secondsPerDay) + ' day' + ((Math.round(
          seconds / secondsPerDay) > 1) ? 's' : '');
    } else if (seconds / secondsPerHour >= 1) {
      return sign + Math.round(seconds / secondsPerHour) + ' hour' + ((Math.round(
          seconds / secondsPerHour) > 1) ? 's' : '');
    } else if (seconds / secondsPerMinute >= 1) {
      return sign + Math.round(seconds / secondsPerMinute) + ' minute' + ((
        Math.round(seconds / secondsPerMinute) > 1) ? 's' : '');
    } else {
      return sign + seconds + ' second' + ((seconds > 1 || seconds === 0) ? 's' : '');
    }
  }
};
