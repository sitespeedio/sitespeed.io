'use strict';

const toArray = require('./util').toArray,
  isEmpty = require('lodash.isempty'),
  get = require('lodash.get'),
  set = require('lodash.set'),
  merge = require('lodash.merge'),
  log = require('intel'),
  reduce = require('lodash.reduce');

function normalizePath(path) {
  if (path.endsWith('.*')) return path.slice(0, -2);

  return path;
}

function mergePath(destination, source, path) {
  const value = get(source, path);
  if (value !== undefined) {
    return set(destination, path, value);
  } else {
    return destination;
  }
}

module.exports = {
  /**
   *
   * @param {Object} json
   * @param {Array|string} metricPaths
   */
  filterMetrics(json, metricPaths) {
    metricPaths = toArray(metricPaths);
    if (typeof json !== 'object') return undefined;

    return metricPaths.reduce((result, path) => {
      path = normalizePath(path);

      const firstWildcard = path.indexOf('*.');

      if (firstWildcard === -1) {
        mergePath(result, json, path);
      } else if (firstWildcard === 0) {
        const leafPath = path.substring(2);

        reduce(
          json,
          (result, value, key) => {
            if (typeof value === 'object') {
              const leaf = this.filterMetrics(value, leafPath);

              if (!isEmpty(leaf)) {
                result[key] = leaf;
              }
            }
            return result;
          },
          result
        );
      } else {
        let branchPath = path.substring(0, firstWildcard);
        if (branchPath.endsWith('.')) branchPath = branchPath.slice(0, -1);

        let branch = get(json, branchPath);
        // We have ocurrences where the branch is undefined for WebPageTest data
        // https://github.com/sitespeedio/sitespeed.io/issues/1897
        if (!branch) {
          log.error(
            'Metricsfilter: The ' +
              branchPath +
              ' is missing from the metrics ' +
              metricPaths
          );
          return result;
        }
        const leafPath = path.substring(firstWildcard + 2);
        const leafs = Object.keys(branch).reduce((result, key) => {
          const leaf = this.filterMetrics(branch[key], leafPath);

          if (!isEmpty(leaf)) {
            result[key] = leaf;
          }
          return result;
        }, {});

        branch = get(result, branchPath, leafs);
        branch = merge(branch, leafs);
        if (!isEmpty(branch)) {
          return set(result, branchPath, branch);
        }
      }

      return result;
    }, {});
  }
};
