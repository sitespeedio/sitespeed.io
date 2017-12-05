'use strict';

const verify = require('./verify').verify;
const tap = require('./tap');
const junit = require('./junit');
const log = require('intel').getLogger('sitespeedio.plugin.budget');

module.exports = {
  open(context, options) {
    this.options = options;
    this.storageManager = context.storageManager;
    this.result = context.budget;
    this.budgetTypes = [
      'browsertime.pageSummary',
      'webpagetest.pageSummary',
      'pagexray.pageSummary',
      'coach.pageSummary'
    ];
  },
  processMessage(message) {
    if (!this.options.budget) {
      return;
    }

    if (this.budgetTypes.indexOf(message.type) > -1) {
      verify(message, this.result, this.options.budget.config);
    } else {
      switch (message.type) {
        case 'budget.addMessageType': {
          if (!message.data.type) {
            log.error('Received add message for budget without message type');
          } else {
            this.budgetTypes.push(message.data.type);
          }
          break;
        }

        case 'sitespeedio.render': {
          if (this.options.budget) {
            if (this.options.budget.output === 'tap') {
              tap.writeTap(this.result, this.storageManager.getBaseDir());
            } else if (this.options.budget.output === 'junit') {
              junit.writeJunit(this.result, this.storageManager.getBaseDir());
            } else {
              let failing = 0;
              let working = 0;
              for (const url of Object.keys(this.result.failing)) {
                for (const result of this.result.failing[url]) {
                  log.error(
                    'Failing budget %s.%s for %s with value %s %s limit %s',
                    result.type,
                    result.metric,
                    url,
                    result.value,
                    result.limitType,
                    result.limit
                  );
                  failing = failing + 1;
                }
              }
              for (const url of Object.keys(this.result.working)) {
                working = working + this.result.working[url].length;
              }
              log.info(
                'Budget: %d working and %d failing tests',
                working,
                failing
              );
            }
          }
        }
      }
    }
  }
};
