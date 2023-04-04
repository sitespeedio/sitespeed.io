/**
 * The old verificatuion and budget.json was deprecated in 8.0
 */
import get from 'lodash.get';
import { noop, size } from '../../support/helpers/index.js';
import intel from 'intel';
const log = intel.getLogger('sitespeedio.plugin.budget');

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
  if (metric.includes('transferSize') || metric.includes('contentSize')) {
    return size.format;
  } else if (metric.includes('timings')) {
    return function (time) {
      return time + ' ms';
    };
  } else return noop;
}

export function verify(message, result, budgets) {
  const failing = [];
  const working = [];
  // do we have an entry in the budget for this kind of message?
  if (budgets[message.type]) {
    for (var budget of budgets[message.type]) {
      let value = get(message.data, budget.metric);

      if (value === undefined) {
        log.debug('Missing data for budget metric ' + budget.metric);
      } else {
        const format = getHelperFunction(budget.metric);

        const item = getItem(
          message.url,
          message.type,
          budget.metric,
          format(value),
          budget.max === undefined ? format(budget.min) : format(budget.max),
          budget.max === undefined ? 'min' : 'max'
        );

        if (budget.max === undefined) {
          if (value >= budget.min) {
            working.push(item);
          } else {
            item.status = 'failing';
            failing.push(item);
          }
        } else {
          if (value <= budget.max) {
            working.push(item);
          } else {
            item.status = 'failing';
            failing.push(item);
          }
        }
      }
    }
  }

  // group working/failing per URL
  if (failing.length > 0) {
    result.failing[message.url] = result.failing[message.url]
      ? [...result.failing[message.url], ...failing]
      : failing;
  }

  if (working.length > 0) {
    result.working[message.url] = result.working[message.url]
      ? [...result.working[message.url], ...working]
      : working;
  }
}
