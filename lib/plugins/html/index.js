'use strict';

const path = require('path'),
  merge = require('lodash.merge'),
  HTMLBuilder = require('./htmlBuilder');

// lets keep this in the HTML context, since we need things from the
// regular options object in the output
const defaultConfig = {
  html: {
    showAllWaterfallSummary: false
  }
}

module.exports = {
  name() {
    return path.basename(__dirname);
  },

  open(context, options) {
    this.options = merge({}, defaultConfig, options);
    this.HTMLBuilder = new HTMLBuilder(context, this.options);
  },

  close() {
    return this.HTMLBuilder.render();
  },
  config: defaultConfig
};
