'use strict';

let urlParser = require('url');

module.exports = {
  keypathFromUrl(url, includeQueryParams)
  {
    function toSafeKey(key) {
      return key.replace(/[.~ /+|,]|%7C/g, '_');
    }

    function flattenQueryParams(params) {
      return Object.keys(params).reduce((result, key) => {
        return [result, key, params[key]].filter(Boolean).join('_');
      }, '');
    }

    url = urlParser.parse(url, !!includeQueryParams);

    let keys = [
      toSafeKey(url.hostname),
      toSafeKey(url.pathname)
    ];

    if (includeQueryParams) {
      keys.push(toSafeKey(flattenQueryParams(url.query)));
    }

    return keys.filter((key) => (key && key.length)).join('.');
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
            recursiveFlatten(target, keyPrefix + '.' + key, value[key]);
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
          throw new Error('Unhandled value type ' + valueType + ' found when flattening data');
      }
    }

    let retVal = {};
    recursiveFlatten(retVal, message.source, message.data);
    return retVal;
  }
};
