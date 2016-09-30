'use strict';

let verify = require('./verify').verify,
  log = require('intel'),
  tap = require('./tap'),
  path = require('path');

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    this.options = options;
    this.result = context.budget;
  },
  processMessage(message) {
    if (!this.options.budget) {
      return;
    }
    switch (message.type) {
      case 'browsertime.pageSummary':
      case 'webpagetest.pageSummary':
      case 'pagexray.pageSummary':
      case 'coach.pageSummary':
        {
          verify(message, this.result, this.options);
          return;
        }

        // TODO we cannot handle the structure of assets.aggregateSizePerContentType
        // it probably means we should change that
    }
  },
  close() {
    if (this.options.budget) {
      log.info(JSON.stringify(this.result, undefined, 1));
      if (this.options.budget.output === 'tap') {
        tap.writeTap(this.result);
      }
    }
  }
};
