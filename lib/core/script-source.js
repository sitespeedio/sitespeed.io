'use strict';
const messageMaker = require('../support/messageMaker');

const make = messageMaker('scrtipt-reader').make;

module.exports = {
  open(context, options) {
    this.options = options;
  },
  findUrls(queue) {
    queue.postMessage(
      make('browsertime.navigationScripts', {}, { url: this.options.urls })
    );
  }
};
