import { Stats } from 'fast-stats';
import get from 'lodash.get';
import set from 'lodash.set';

function percentileName(percentile) {
  if (percentile === 0) {
    return 'min';
  } else if (percentile === 100) {
    return 'max';
  } else {
    return 'p' + String(percentile).replace('.', '_');
  }
}

function isFiniteNumber(n) {
  return typeof n === 'number' && Number.isFinite(n);
}

export function pushStats(target, path, data) {
  if (!isFiniteNumber(data))
    throw new Error(`Tried to add ${data} to stats for path ${path}`);

  const stats = get(target, path, new Stats());
  stats.push(data);
  set(target, path, stats);
}
export function pushGroupStats(target, domainTarget, path, data) {
  pushStats(target, path, data);
  pushStats(domainTarget, path, data);
}
export function setStatsSummary(target, path, stats) {
  set(target, path, summarizeStats(stats));
}
export function setStatsSummaryWithOptions(target, path, stats, options) {
  set(target, path, summarizeStats(stats, options));
}
export function summarizeStats(stats, options) {
  if (stats.length === 0) {
    return;
  }

  options = options || {};
  let percentiles = options.percentiles || [0, 90, 100];
  let decimals = options.decimals || 0;
  if (stats.median() < 1 && stats.median() > 0) {
    decimals = 4;
  }

  let data = {
    median: Number.parseFloat(stats.median().toFixed(decimals)),
    mean: Number.parseFloat(stats.amean().toFixed(decimals)),
    rsd:
      stats.stddev() > 0
        ? Number.parseFloat((100 * stats.stddev()) / stats.amean())
        : 0, // Relative standard deviation
    stddev: Number.parseFloat(stats.stddev().toFixed(decimals))
  };
  for (const p of percentiles) {
    let name = percentileName(p);
    const percentile = stats.percentile(p);
    if (Number.isFinite(percentile)) {
      data[name] = Number.parseFloat(percentile.toFixed(decimals));
    } else {
      throw new TypeError(
        'Failed to calculate ' +
          name +
          ' for stats: ' +
          JSON.stringify(stats, undefined, 2)
      );
    }
  }
  if (options.includeSum) {
    data.sum = Number.parseFloat(stats.Σ().toFixed(decimals));
  }

  return data;
}
