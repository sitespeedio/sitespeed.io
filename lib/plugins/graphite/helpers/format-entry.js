/**
 * picks the correct format for a graphite entry
 * @param  {string}  [type='graphite'] ['statsd', 'graphite']
 * @return {string}  The string template
 */
module.exports = type => {
  switch (type) {
    case 'statsd':
      return '%s:%s|ms';
    case 'graphite':
    default:
      return '%s %s %s';
  }
};
