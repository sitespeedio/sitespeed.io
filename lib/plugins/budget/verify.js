'use strict';

let get = require('lodash.get'),
  noop = require('../../support/helpers').noop,
  size = require('../../support/helpers').size.format,
  log = require('intel');

function getItem(url, type, metric, value, limit, limitType) {
  return {
    metric,
    type,
    value,
    limit,
    limitType,
    status: 'working'
  };
}

function getHelperFunction(metric) {
  if (metric.indexOf('transferSize') > -1 || metric.indexOf('contentSize') > -1) {
    return size;
  } else if (metric.indexOf('timings') > -1) {
    return function(time) {
      return time + ' ms';
    }
  } else return noop;
}

module.exports = {
  verify(message, result, budgets) {
    const failing = [];
    const working = [];
    // do we have an etry in the budget for this kind of message?
    if (budgets[message.type]) {
      for (var budget of budgets[message.type]) {

        let value = get(message.data, budget.metric);

        if (value !== undefined) {
          const format = getHelperFunction(budget.metric);

          const item = getItem(message.url, message.type, budget.metric, format(value), budget.max !== undefined ? format(budget.max) : format(budget.min),  budget.max !== undefined ? 'max': 'min');

          if (budget.max !== undefined) {
            if (value <= budget.max) {
              working.push(item);
            } else {
              item.status = 'failing';
              failing.push(item);
            }
          } else {
            if (value >= budget.min) {
              working.push(item);
            } else {
              item.status = 'failing';
              failing.push(item);
            }
          }
        } else {
          log.debug('Missing data for budget metric ' + budget.metric);
        }
      }
    }

    // group working/failing per URL
    if (failing.length > 0) {
      result.failing[message.url] = result.failing[message.url] ? result.failing[message.url].concat(failing) : failing;
    }

    if (working.length > 0) {
      result.working[message.url] = result.working[message.url] ? result.working[message.url].concat(working) : working;
    }
  }
}
