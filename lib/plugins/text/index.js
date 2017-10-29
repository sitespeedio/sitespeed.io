'use strict';

const textBuilder = require('./textBuilder');
const merge = require('lodash.merge');
const set = require('lodash.set');

module.exports = {
  open(context, options) {
    this.metrics = {};
    this.options = options;
    this.context = context;
  },

  processMessage(message) {
    if (message.type.endsWith('.summary')) {
      const data = {};
      set(data, message.type, message.data);
      merge(this.metrics, data);
    }
  },
  close(options) {
    if (!options.summary) return;
    const renderer = this.options.summaryDetail
      ? textBuilder.renderSummary
      : textBuilder.renderBriefSummary;
    return renderer(this.metrics, this.context, options);
  }
};
