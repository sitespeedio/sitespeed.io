import { format } from 'node:util';

export function toArray(arrayLike) {
  if (arrayLike === undefined || arrayLike === null) {
    return [];
  }
  if (Array.isArray(arrayLike)) {
    return arrayLike;
  }
  return [arrayLike];
}
export function throwIfMissing(options, keys, namespace) {
  let missingKeys = keys.filter(key => !options[key]);
  if (missingKeys.length > 0) {
    throw new Error(
      format(
        'Required option(s) %s need to be specified in namespace "%s"',
        missingKeys.map(s => '"' + s + '"'),
        namespace
      )
    );
  }
}

export function isEmpty(value) {
  if (value === null) return true;

  if (value === undefined) return true;

  if (typeof value === 'boolean') return false;

  if (typeof value === 'number') return false;

  if (typeof value === 'string') return value.length === 0;

  if (typeof value === 'function') return false;

  if (Array.isArray(value)) return value.length === 0;

  if (value instanceof Map || value instanceof Set) return value.size === 0;

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
}
