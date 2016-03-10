'use strict';

const get = require('lodash.get'),
  set = require('lodash.set'),
  merge = require('lodash.merge');

function toArray(arrayLike) {
  if (arrayLike == null) {
    return [];
  }
  if (Array.isArray(arrayLike)) {
    return arrayLike;
  }
  return [arrayLike];
}

function normalizePath(path) {
  if (!path)
    return path;

  if (path.endsWith('.*'))
    return path.slice(0, -2);

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

    if (typeof json !== 'object')
      return undefined;

    return metricPaths.reduce((result, path) => {
      path = normalizePath(path);

      const firstWildcard = path.indexOf('*.');

      if (firstWildcard === -1) {
        return mergePath(result, json, path);
      } else if (firstWildcard === 0) {
        const leafPath = path.substring(2);

        const paths = Object.keys(json).map((key) => key + '.' + leafPath);

        return this.filterMetrics(json, paths);
      } else {
        let branchPath = path.substring(0, firstWildcard);
        if (branchPath.endsWith('.'))
          branchPath = branchPath.slice(0, -1);


        let branch = get(json, branchPath);
        const leafPath = path.substring(firstWildcard + 2);

        const leafs = Object.keys(branch).reduce((result, key) => {
          const leaf = this.filterMetrics(branch[key], leafPath);

          if (leaf && Object.keys(leaf).length > 0) {
            result[key] = leaf;
          }
          return result;
        }, {});

        branch = get(result, branchPath, leafs);
        branch = merge(branch, leafs);
        return set(result, branchPath, branch);
      }
    }, {});
  }
};
