'use strict';

const path = require('path');
const textBuilder = require('./textBuilder');

module.exports = {
  name() {
    return path.basename(__dirname);
  },

  open(context, options) {
    this.dataCollection = context.dataCollection;
    this.options = options;
  },

  close(options) {
    if (!options.summary) return;
    const renderer = this.options.summaryDetail ? textBuilder.renderSummary : textBuilder.renderBriefSummary;
    return renderer(this.dataCollection, options);
  }
};
