'use strict';

/**
 * The old verificatuion and budget.json was deprecated in 8.0
 */
const get = require('lodash.get');
const merge = require('lodash.merge');
const noop = require('../../support/helpers').noop;
const ms = require('../../support/helpers').time.ms;
const size = require('../../support/helpers').size.format;
const log = require('intel').getLogger('sitespeedio.plugin.budget');
const friendlyNames = require('./friendlynames');

function getItem(fullPath, type, metric, value, limit, limitType) {
  const format = getHelperFunction(fullPath);
  return {
    metric,
    type,
    value,
    friendlyValue: format(value),
    limit,
    friendlyLimit: format(limit),
    limitType,
    status: 'working'
  };
}

function getHelperFunction(metric) {
  if (
    metric.indexOf('transferSize') > -1 ||
    metric.indexOf('contentSize') > -1
  ) {
    return size;
  } else if (metric.indexOf('timings') > -1) {
    return ms;
  } else return noop;
}

module.exports = {
  verify(message, result, budgets) {
    // Let us merge the specific configuration for this URL together
    // with the generic one. In the future we can fine tune this, since
    // we keep all metrics within a sppecific URL
    const budgetSetupSpecificForThisURL = get(budgets.budget, message.url);
    const budgetForThisURL = {};
    merge(budgetForThisURL, budgets.budget, budgetSetupSpecificForThisURL);

    if (
      message.type != 'browsertime.pageSummary' &&
      message.type != 'coach.pageSummary' &&
      message.type != 'pagexray.pageSummary'
    ) {
      log.info(
        'At the moment Lighthouse, GPSI and WebPageTest is only supported in the internal budget format, see https://www.sitespeed.io/documentation/sitespeed.io/performance-budget/#budget-configuration-using-the-internal-data-structrure'
      );
      return;
    }

    // Keep failing/working metrics here
    const failing = [];
    const working = [];
    const url = message.url;
    log.verbose('Applying budget to url %s', url);
    const tool = message.type.split('.')[0];
    // Go through all metrics that are configured
    // timing, request, coach etc
    for (let metricType of Object.keys(budgetForThisURL)) {
      for (let metric of Object.keys(budgetForThisURL[metricType])) {
        if (friendlyNames[tool][metricType]) {
          const fullPath = friendlyNames[tool][metricType][metric];
          let value = get(message.data, fullPath);
          // We got a matching metric
          if (value) {
            const budgetValue = budgetForThisURL[metricType][metric];
            const item = getItem(
              fullPath,
              metricType,
              metric,
              value,
              budgetValue,
              tool === 'coach' ? 'min' : 'max'
            );
            if (tool === 'coach') {
              if (value < budgetValue) {
                item.status = 'failing';
                failing.push(item);
              } else {
                working.push(item);
              }
            } else {
              if (value > budgetValue) {
                item.status = 'failing';
                failing.push(item);
              } else {
                working.push(item);
              }
            }
          } else {
            log.debug('Missing data for budget metric ' + metric);
          }
        }
      }
    }
    // group working/failing per URL
    if (failing.length > 0) {
      result.failing[message.url] = result.failing[message.url]
        ? result.failing[message.url].concat(failing)
        : failing;
    }

    if (working.length > 0) {
      result.working[message.url] = result.working[message.url]
        ? result.working[message.url].concat(working)
        : working;
    }
  }
};
