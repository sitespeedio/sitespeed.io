import intel from 'intel';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import { verify as deprecatedVerify } from './deprecatedVerify.js';
import { verify } from './verify.js';
import { writeTap } from './tap.js';
import { writeJunit } from './junit.js';
import { writeJson } from './json.js';

const log = intel.getLogger('sitespeedio.plugin.budget');

export default class BudgetPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'budget', options, context, queue });
  }

  open(context, options) {
    this.options = options;
    this.budgetOptions = options.budget || {};
    this.storageManager = context.storageManager;
    this.result = context.budget;
    this.alias = {};
    this.make = context.messageMaker('budget').make;
    this.budgetTypes = [
      'browsertime.pageSummary',
      'pagexray.pageSummary',
      'coach.pageSummary',
      'axe.pageSummary'
    ];
  }
  processMessage(message, queue) {
    // if there's no configured budget do nothing
    if (!this.options.budget) {
      return;
    }

    if (message.type === 'browsertime.alias') {
      this.alias[message.url] = message.data;
      return;
    }
    const budget = this.options.budget.config;

    if (this.budgetTypes.includes(message.type)) {
      // If it doesn't have the new structure of a budget file
      // use the old verdion
      if (budget.budget) {
        verify(message, this.result, budget, this.alias[message.url]);
      } else {
        deprecatedVerify(message, this.result, budget);
      }
    } else {
      switch (message.type) {
        case 'budget.addMessageType': {
          if (message.data.type) {
            this.budgetTypes.push(message.data.type);
          } else {
            log.error('Received add message for budget without message type');
          }
          break;
        }

        case 'sitespeedio.prepareToRender': {
          let failing = 0;
          let working = 0;
          for (const url of Object.keys(this.result.failing)) {
            for (const result of this.result.failing[url]) {
              log.info(
                'Failing budget %s for %s with value %s %s limit %s',
                result.metric,
                url,
                result.friendlyValue || result.value,
                result.limitType,
                result.friendlyLimit || result.limit
              );
              failing = failing + 1;
            }
          }

          queue.postMessage(this.make('budget.result', this.result));

          if (this.budgetOptions.removeWorkingResult) {
            for (const url of Object.keys(this.result.working)) {
              // Make sure we don't have a failing test for that URL
              if (!this.result.failing[url]) {
                queue.postMessage(this.make('remove.url', {}, { url }));
              }
            }
          }

          for (const url of Object.keys(this.result.working)) {
            working = working + this.result.working[url].length;
          }
          log.info(
            'Budget: %d working, %d failing tests and %d errors',
            working,
            failing,
            Object.keys(this.result.error).length
          );
          break;
        }
        case 'error': {
          if (message.url) {
            this.result.error[message.url] = message.data;
          }
          break;
        }

        case 'sitespeedio.render': {
          if (this.options.budget) {
            switch (this.options.budget.output) {
              case 'json': {
                writeJson(this.result, this.storageManager.getBaseDir());

                break;
              }
              case 'tap': {
                writeTap(this.result, this.storageManager.getBaseDir());

                break;
              }
              case 'junit': {
                writeJunit(
                  this.result,
                  this.storageManager.getBaseDir(),
                  this.options
                );

                break;
              }
            }
          }
        }
      }
    }
  }
}
