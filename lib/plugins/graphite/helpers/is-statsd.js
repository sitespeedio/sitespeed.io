/**
 * Graphite options qualify for StatsD use
 * @param  {Object} opts graphite options
 * @return {boolean}
 */
export function isStatsD(options = {}) {
  return options.statsd === true;
}
