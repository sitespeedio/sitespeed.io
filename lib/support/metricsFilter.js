/* eslint-disable unicorn/no-array-reduce */
import isEmpty from 'lodash.isempty';
import get from 'lodash.get';
import set from 'lodash.set';
import merge from 'lodash.merge';
import reduce from 'lodash.reduce';

import { toArray } from './util.js';

function normalizePath(path) {
  if (path.endsWith('.*')) return path.slice(0, -2);

  return path;
}

function mergePath(destination, source, path) {
  const value = get(source, path);
  return value === undefined ? destination : set(destination, path, value);
}

export function filterMetrics(json, metricPaths) {
  metricPaths = toArray(metricPaths);
  if (typeof json !== 'object') return;

  return metricPaths.reduce((result, path) => {
    path = normalizePath(path);

    const firstWildcard = path.indexOf('*.');

    if (firstWildcard === -1) {
      mergePath(result, json, path);
    } else if (firstWildcard === 0) {
      const leafPath = path.slice(2);

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
      let branchPath = path.slice(0, Math.max(0, firstWildcard));
      if (branchPath.endsWith('.')) branchPath = branchPath.slice(0, -1);

      const leafPath = path.slice(Math.max(0, firstWildcard + 2));
      const leafs = Object.keys(branch).reduce((result, key) => {
        const leaf = filterMetrics(branch[key], leafPath);

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
