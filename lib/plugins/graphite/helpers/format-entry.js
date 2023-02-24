/**
 * picks the correct format for a graphite entry
 * @param  {string}  [type='graphite'] ['statsd', 'graphite']
 * @return {string}  The string template
 */
export function formatEntry(type) {
  switch (type) {
    case 'statsd': {
      return '%s:%s|ms';
    }
    default: {
      return '%s %s %s';
    }
  }
}
