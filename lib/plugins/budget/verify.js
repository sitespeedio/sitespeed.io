'use strict';

let get = require('lodash.get'),
  noop = require('../../support/helpers').noop,
  size = require('../../support/helpers').size.format,
  log = require('intel');

function getItem(url, type, metric, value, limit) {
  return {
    metric,
    type,
    value,
    limit
  };
}

module.exports = {
  verify(message, result, options) {
    const budgets = options.budget;
    const failing = [];
    const working = [];
    // do we have an etry in the budget for this kind of message?
    if (budgets[message.type]) {
      for (var budget of budgets[message.type]) {

        let value = get(message.data, budget.metric);

        if (value !== undefined) {
          let format = noop;
          if (budget.metric.indexOf('transferSize') > -1 || budget.metric.indexOf('contentSize') > -1) {
            format = size;
          }
          const item = getItem(message.url, message.type, budget.metric, format(value), budget.max !== undefined ? format(budget.max) : format(budget.min));

          if (budget.max !== undefined) {
            if (value <= budget.max) {
              working.push(item);
            } else {
              failing.push(item);
            }
          } else {
            if (value >= budget.min) {
              working.push(item);
            } else {
              failing.push(item);
            }
          }
        } else {
          log.debug('Missing data for budget metric ' + budget.metric);
        }
      }
    }

    // group working/failing per URL
    result.failing[message.url] = result.failing[message.url] ? result.failing[message.url].concat(failing) : failing;

    result.working[message.url] = result.working[message.url] ? result.working[message.url].concat(working) : working;
  }
}
