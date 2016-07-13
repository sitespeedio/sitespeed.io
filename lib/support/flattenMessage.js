'use strict';

const urlParser = require('url');

function joinNonEmpty(strings, delimeter) {
  return strings.filter(Boolean).join(delimeter);
}

function toSafeKey(key) {
  return key.replace(/[.~ /+|,]|%7C/g, '_');
}

module.exports = {
  keypathFromUrl(url, includeQueryParams)
  {
    function flattenQueryParams(params) {
      return Object.keys(params).reduce((result, key) =>
          joinNonEmpty([result, key, params[key]], '_'),
        '');
    }

    url = urlParser.parse(url, !!includeQueryParams);

    let path = toSafeKey(url.pathname);

    if (includeQueryParams) {
      path = joinNonEmpty([path, toSafeKey(flattenQueryParams(url.query))], '_');
    }

    const keys = [
      toSafeKey(url.hostname),
      path
    ];

    return joinNonEmpty(keys, '.');
  },

  flattenMessageData(message) {
    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function recursiveFlatten(target, keyPrefix, value) {
      const valueType = typeof value;

      switch (valueType) {
        case 'number':
        {
          target[keyPrefix] = value;
        }
          break;
        case 'object':
        {
          if (value === null) {
            break;
          }
          Object.keys(value).forEach((key) => {
            recursiveFlatten(target, joinNonEmpty([keyPrefix, toSafeKey(key)], '.'), value[key]);
          });
        }
          break;
        case 'string':
        {
          if (isNumeric(value)) {
            target[keyPrefix] = parseFloat(value);
          }
        }
          break;
        case 'boolean':
        {
          target[keyPrefix] = value ? 1 : 0;
        }
          break;
        default:
          throw new Error('Unhandled value type ' + valueType + ' found when flattening data for prefix ' + keyPrefix);
      }
    }

    let retVal = {};
    recursiveFlatten(retVal, '', message.data);
    return retVal;
  }
};
