import { parse } from 'node:url';
import { createHash } from 'node:crypto';

import isEmpty from 'lodash.isempty';
import intel from 'intel';

const log = intel.getLogger('sitespeedio.file');

function toSafeKey(key) {
  // U+2013 : EN DASH – as used on https://en.wikipedia.org/wiki/2019–20_coronavirus_pandemic
  return key.replaceAll(/[ %&()+,./:?|~–]|%7C/g, '-');
}

export function pathToFolder(url, options, alias) {
  const useHash = options.useHash;
  const parsedUrl = parse(decodeURIComponent(url));

  const pathSegments = [];
  const urlSegments = [];
  pathSegments.push('pages', parsedUrl.hostname.split('.').join('_'));

  if (options.urlMetaData && options.urlMetaData[url]) {
    pathSegments.push(options.urlMetaData[url]);
  } else if (alias) {
    pathSegments.push(alias);
  } else {
    if (!isEmpty(parsedUrl.pathname)) {
      urlSegments.push(...parsedUrl.pathname.split('/').filter(Boolean));
    }

    if (useHash && !isEmpty(parsedUrl.hash)) {
      const md5 = createHash('md5'),
        hash = md5.update(parsedUrl.hash).digest('hex').slice(0, 8);
      urlSegments.push('hash-' + hash);
    }

    if (!isEmpty(parsedUrl.search)) {
      const md5 = createHash('md5'),
        hash = md5.update(parsedUrl.search).digest('hex').slice(0, 8);
      urlSegments.push('query-' + hash);
    }

    // This is used from sitespeed.io to match URLs on Graphite
    if (options.storeURLsAsFlatPageOnDisk) {
      const folder = toSafeKey(urlSegments.join('_').concat('_'));
      if (folder.length > 255) {
        log.info(
          `The URL ${url} hit the 255 character limit used when stored on disk, you may want to give your URL an alias to make sure it will not collide with other URLs.`
        );
        pathSegments.push(folder.slice(0, 254));
      } else {
        pathSegments.push(folder);
      }
    } else {
      pathSegments.push(...urlSegments);
    }
  }

  // pathSegments.push('data');

  for (const [index, segment] of pathSegments.entries()) {
    if (segment) {
      pathSegments[index] = segment.replaceAll(/[^\w.\u0621-\u064A-]/gi, '-');
    }
  }

  return pathSegments.join('/').concat('/');
}
