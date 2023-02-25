import { parse } from 'node:url';
import intel from 'intel';
const log = intel.getLogger('sitespeedio');

function joinNonEmpty(strings, delimeter) {
  return strings.filter(Boolean).join(delimeter);
}

function toSafeKey(key) {
  // U+2013 : EN DASH – as used on https://en.wikipedia.org/wiki/2019–20_coronavirus_pandemic
  return key.replace(/[ %&()+,./:?|~–]|%7C/g, '_');
}

export function keypathFromUrl(url, includeQueryParameters, useHash, group) {
  function flattenQueryParameters(parameters) {
    return Object.keys(parameters).reduce(
      (result, key) => joinNonEmpty([result, key, parameters[key]], '_'),
      ''
    );
  }

  url = parse(url, !!includeQueryParameters);

  let path = toSafeKey(url.pathname);

  if (includeQueryParameters) {
    path = joinNonEmpty(
      [path, toSafeKey(flattenQueryParameters(url.query))],
      '_'
    );
  }
  if (useHash && url.hash) {
    path = joinNonEmpty([path, toSafeKey(url.hash)], '_');
  }

  const keys = [toSafeKey(group || url.hostname), path];

  return joinNonEmpty(keys, '.');
}

function isNumericString(n) {
  // eslint-disable-next-line unicorn/prefer-number-properties
  return !isNaN(Number.parseFloat(n)) && isFinite(n);
}

export function flattenMessageData({ data, type }) {
  function recursiveFlatten(target, keyPrefix, value) {
    // super simple version to avoid flatten HAR and screenshot data
    if (/(screenshots\.|har\.)/.test(keyPrefix)) {
      return;
    }

    // Google is overloading User Timing marks
    // See https://github.com/sitespeedio/browsertime/issues/257
    if (keyPrefix.includes('userTimings.marks.goog_')) {
      return;
    }

    // Google is overloading User Timing marks = the same using WebPageTest
    // See https://github.com/sitespeedio/browsertime/issues/257
    if (keyPrefix.includes('userTimes.goog_')) {
      return;
    }

    // Hack to remove visual progress from default metrics
    if (keyPrefix.includes('visualMetrics.VisualProgress')) {
      return;
    }

    if (keyPrefix.includes('visualMetrics.videoRecordingStart')) {
      return;
    }

    const valueType = typeof value;

    switch (valueType) {
      case 'number': {
        {
          if (Number.isFinite(value)) {
            target[keyPrefix] = value;
          } else {
            log.warn(
              `Non-finite number '${value}' found at path '${keyPrefix}' for '${type}' message (url = ${data.url})`
            );
          }
        }
        break;
      }
      case 'object': {
        {
          if (value === null) {
            break;
          }

          for (const key of Object.keys(value)) {
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
          }
        }
        break;
      }
      case 'string': {
        {
          if (isNumericString(value)) {
            target[keyPrefix] = Number.parseFloat(value);
          }
        }
        break;
      }
      case 'boolean': {
        {
          target[keyPrefix] = value ? 1 : 0;
        }
        break;
      }
      case 'undefined': {
        {
          log.debug(
            `Undefined value found at path '${keyPrefix}' for '${type}' message (url = ${data.url})`
          );
        }
        break;
      }
      default: {
        throw new Error(
          'Unhandled value type ' +
            valueType +
            ' found when flattening data for prefix ' +
            keyPrefix
        );
      }
    }
  }

  let returnValueValue = {};
  recursiveFlatten(returnValueValue, '', data);
  return returnValueValue;
}
