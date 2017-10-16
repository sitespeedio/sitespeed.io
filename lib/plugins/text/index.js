'use strict';

const textBuilder = require('./textBuilder');
const DataCollector = require('../../support/dataCollector');
const set = require('lodash.set');

module.exports = {
  open(context, options) {
    this.dataCollector = new DataCollector(context);
    this.options = options;
    this.context = context;
  },

  processMessage(message) {
    const dataCollector = this.dataCollector;

    if (message.type.endsWith('.summary')) {
      const data = {};
      set(data, message.type, message.data);
      dataCollector.addSummary('text', data);
    }
  },
  close(options) {
    if (!options.summary) return;
    const renderer = this.options.summaryDetail
      ? textBuilder.renderSummary
      : textBuilder.renderBriefSummary;
    return renderer(this.dataCollector, this.context, options);
  }
};
