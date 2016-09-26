'use strict';

const path = require('path'),
  HTMLBuilder = require('./htmlBuilder');

module.exports = {
  name() {
    return path.basename(__dirname);
  },

  open(context, options) {
    this.HTMLBuilder = new HTMLBuilder(context, options);
    this.options = options;
  },

  close() {
    return this.HTMLBuilder.render();
  }
};
