'use strict';

const textBuilder = require('./textBuilder');

module.exports = {
  open(context, options) {
    this.dataCollection = context.dataCollection;
    this.options = options;
    this.context = context;
  },

  close(options) {
    if (!options.summary) return;
    const renderer = this.options.summaryDetail
      ? textBuilder.renderSummary
      : textBuilder.renderBriefSummary;
    return renderer(this.dataCollection, this.context, options);
  }
};
