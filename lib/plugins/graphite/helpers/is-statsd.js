/**
 * Graphite options qualify for StatsD use
 * @param  {Object} opts graphite options
 * @return {boolean}
 */
module.exports = (opts = {}) => opts.statsd === true;
