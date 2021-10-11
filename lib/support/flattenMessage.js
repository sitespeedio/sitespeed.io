'use strict';

const urlParser = require('url');
const log = require('intel');

function joinNonEmpty(strings, delimeter) {
  return strings.filter(Boolean).join(delimeter);
}

function toSafeKey(key) {
  // U+2013 : EN DASH – as used on https://en.wikipedia.org/wiki/2019–20_coronavirus_pandemic
  return key.replace(/[.~ /+|,:?&%–)(]|%7C/g, '_');
}

module.exports = {
  keypathFromUrl(url, includeQueryParams, useHash, group) {
    function flattenQueryParams(params) {
      return Object.keys(params).reduce(
        (result, key) => joinNonEmpty([result, key, params[key]], '_'),
        ''
      );
    }

    url = urlParser.parse(url, !!includeQueryParams);

    let path = toSafeKey(url.pathname);

    if (includeQueryParams) {
      path = joinNonEmpty(
        [path, toSafeKey(flattenQueryParams(url.query))],
        '_'
      );
    }
    if (useHash && url.hash) {
      path = joinNonEmpty([path, toSafeKey(url.hash)], '_');
    }

    const keys = [toSafeKey(group || url.hostname), path];

    return joinNonEmpty(keys, '.');
  },

  flattenMessageData({ data, type }) {
    function isNumericString(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function recursiveFlatten(target, keyPrefix, value) {
      // super simple version to avoid flatten HAR and screenshot data
      if (keyPrefix.match(/(screenshots\.|har\.)/)) {
        return;
      }

      // Google is overloading User Timing marks
      // See https://github.com/sitespeedio/browsertime/issues/257
      if (keyPrefix.indexOf('userTimings.marks.goog_') > -1) {
        return;
      }

      // Google is overloading User Timing marks = the same using WebPageTest
      // See https://github.com/sitespeedio/browsertime/issues/257
      if (keyPrefix.indexOf('userTimes.goog_') > -1) {
        return;
      }

      const valueType = typeof value;

      switch (valueType) {
        case 'number':
          {
            if (isFinite(value)) {
              target[keyPrefix] = value;
            } else {
              log.warn(
                `Non-finite number '${value}' found at path '${keyPrefix}' for '${type}' message (url = ${data.url})`
              );
            }
          }
          break;
        case 'object':
          {
            if (value === null) {
              break;
            }

            Object.keys(value).forEach(key => {
              // Hey are you coming to the future from 1980s? Please don't
              // look at this code, it's a ugly hack to make sure we can send assets
              // to Graphite and don't send them with array position, instead
              // use the url to generate the key

              if (type === 'pagexray.pageSummary' && keyPrefix === 'assets') {
                recursiveFlatten(
                  target,
                  joinNonEmpty(
                    [keyPrefix, toSafeKey(value[key].url || key)],
                    '.'
                  ),
                  value[key]
                );
              } else {
                recursiveFlatten(
                  target,
                  joinNonEmpty([keyPrefix, toSafeKey(key)], '.'),
                  value[key]
                );
              }
            });
          }
          break;
        case 'string':
          {
            if (isNumericString(value)) {
              target[keyPrefix] = parseFloat(value);
            }
          }
          break;
        case 'boolean':
          {
            target[keyPrefix] = value ? 1 : 0;
          }
          break;
        case 'undefined':
          {
            log.debug(
              `Undefined value found at path '${keyPrefix}' for '${type}' message (url = ${data.url})`
            );
          }
          break;
        default:
          throw new Error(
            'Unhandled value type ' +
              valueType +
              ' found when flattening data for prefix ' +
              keyPrefix
          );
      }
    }

    let retVal = {};
    recursiveFlatten(retVal, '', data);
    return retVal;
  }
};
