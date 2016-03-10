'use strict';

const clone = require('lodash.clonedeep'),
  metricsFilter = require('./metricsFilter');

const filterForType = {};

module.exports = {
  registerFilterForType(filter, type) {
    filterForType[type] = filter;
  },

  getFilterForType(type) {
    return filterForType[type];
  },

  filterMessage(message) {
    const filterConfig = this.getFilterForType(message.type);

    if (!filterConfig) {
      return message;
    }

    const filteredMessage = clone(message);
    filteredMessage.data = metricsFilter.filterMetrics(filteredMessage.data, filterConfig);
    return filteredMessage;
  }
};
