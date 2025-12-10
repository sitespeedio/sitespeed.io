import { createHash } from 'node:crypto';
import path from 'node:path';
import { getLogger } from '@sitespeed.io/log';
import { isEmpty } from '../../support/util.js';

const log = getLogger('sitespeedio.file');

function isHttpLikeUrl(s) {
  if (typeof s !== 'string' || s.length === 0) return false;
  if (s.startsWith('//')) return true;
  return /^https?:\/\//iu.test(s);
}

function toSafeKey(key) {
  return key.replaceAll(/[ %&()+,./:?|~–]|%7C/gu, '-');
}

function md5Hex8(s) {
  return createHash('md5').update(s).digest('hex').slice(0, 8);
}

function normalizeFsPath(input) {
  let n = path.normalize(input);
  if (n.startsWith(`.${path.sep}`)) n = n.slice(2);
  return n;
}

export function pathToFolder(input, options) {
  if (options.useSameDir) return '';

  let hostname = '';
  let pathname = '';
  let search = '';
  let hash = '';

  const isUrl = isHttpLikeUrl(input);

  if (isUrl) {
    const raw = input.startsWith('//') ? `http:${input}` : input;
    const u = new URL(raw);
    hostname = u.hostname;
    pathname = u.pathname; // '/'-separated
    search = u.search; // includes '?'
    hash = u.hash; // includes '#'
  } else {
    hostname = 'file';
    const fsNormalized = normalizeFsPath(input);
    pathname = `${path.sep}${fsNormalized}`;
  }

  const pathSegments = ['pages', hostname.split('.').join('_')];
  const urlSegments = [];

  if (options.urlMetaData && options.urlMetaData[input]) {
    pathSegments.push(options.urlMetaData[input]);
  } else {
    const parts = isUrl
      ? pathname.split('/').filter(Boolean)
      : pathname.split(/[\\/]/u).filter(Boolean);
    if (!isEmpty(parts)) urlSegments.push(...parts);

    if (isUrl) {
      if (options.useHash && !isEmpty(hash))
        urlSegments.push(`hash-${md5Hex8(hash)}`);
      if (!isEmpty(search)) urlSegments.push(`query-${md5Hex8(search)}`);
    }

    if (options.storeURLsAsFlatPageOnDisk) {
      const folder = toSafeKey(`${urlSegments.join('_')}_`);
      if (folder.length > 255) {
        log.info(
          `The URL ${input} hit the 255 character limit used when stored on disk, you may want to give your URL an alias to make sure it will not collide with other URLs.`
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

  for (const [i, seg] of pathSegments.entries()) {
    if (seg) pathSegments[i] = seg.replaceAll(/[^\w.\u0621-\u064A-]/giu, '-');
  }

  return `${path.join(...pathSegments)}${path.sep}`;
}
