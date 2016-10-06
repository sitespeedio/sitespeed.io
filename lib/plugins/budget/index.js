'use strict';

let verify = require('./verify').verify,
  tap = require('./tap'),
  junit = require('./junit'),
  path = require('path');

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    this.options = options;
    this.storageManager = context.storageManager;
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
    }
  },
  close() {
    if (this.options.budget) {
      if (this.options.budget.output === 'tap') {
        tap.writeTap(this.result, this.storageManager.getBaseDir());
      } else if (this.options.budget.output === 'junit') {
        junit.writeJunit(this.result, this.storageManager.getBaseDir());
      }
    }
  }
};
