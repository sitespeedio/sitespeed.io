import get from 'lodash.get';
import { keypathFromUrl } from './flattenMessage.js';

export function toSafeKey(key, safeChar = '_') {
  return key.replaceAll(/[ %&+,./:?|~–]|%7C/g, safeChar);
}
export function getConnectivity(options) {
  // if we have a friendly name for your connectivity, use that!
  let connectivity = get(options, 'browsertime.connectivity.alias');
  return connectivity
    ? toSafeKey(connectivity.toString())
    : get(options, 'browsertime.connectivity.profile', 'unknown');
}

export function getURLAndGroup(
  options,
  group,
  url,
  includeQueryParameters,
  alias
) {
  if (
    group &&
    options.urlsMetaData &&
    options.urlsMetaData[url] &&
    options.urlsMetaData[url].urlAlias
  ) {
    let alias = options.urlsMetaData[url].urlAlias;
    return toSafeKey(group) + '.' + toSafeKey(alias);
  } else if (alias && alias[url]) {
    return toSafeKey(group) + '.' + toSafeKey(alias[url]);
  } else {
    return keypathFromUrl(url, includeQueryParameters, options.useHash, group);
  }
}
