'use strict';

const merge = require('lodash.merge');
const HTMLBuilder = require('./htmlBuilder');

// lets keep this in the HTML context, since we need things from the
// regular options object in the output
const defaultConfig = {
  html: {
    showAllWaterfallSummary: false
  }
};

module.exports = {
  open(context, options) {
    this.options = merge({}, defaultConfig, options);
    this.HTMLBuilder = new HTMLBuilder(context, this.options);
  },

  close() {
    return this.HTMLBuilder.render();
  },
  config: defaultConfig
};
