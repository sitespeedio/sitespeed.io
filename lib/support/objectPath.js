const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isNullish(value) {
  return value === undefined || value === null;
}

function toPath(path) {
  if (Array.isArray(path)) return path;
  return String(path).split('.');
}

export function get(object, path, defaultValue) {
  let current = object;
  for (const segment of toPath(path)) {
    if (isNullish(current)) return defaultValue;
    current = current[segment];
  }
  return current === undefined ? defaultValue : current;
}

export function set(object, path, value) {
  if (isNullish(object)) return object;
  const segments = toPath(path);
  let current = object;
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (FORBIDDEN_KEYS.has(segment)) return object;
    const next = current[segment];
    if (isNullish(next) || typeof next !== 'object') {
      current[segment] = {};
    }
    current = current[segment];
  }
  const last = segments.at(-1);
  if (!FORBIDDEN_KEYS.has(last)) {
    current[last] = value;
  }
  return object;
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function merge(target, ...sources) {
  if (isNullish(target)) return target;
  for (const source of sources) {
    if (isNullish(source)) continue;
    for (const key of Object.keys(source)) {
      if (FORBIDDEN_KEYS.has(key)) continue;
      const sourceValue = source[key];
      const targetValue = target[key];
      if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
        merge(targetValue, sourceValue);
      } else if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        merge(targetValue, sourceValue);
      } else if (Array.isArray(sourceValue)) {
        target[key] = merge([], sourceValue);
      } else if (isPlainObject(sourceValue)) {
        target[key] = merge({}, sourceValue);
      } else if (sourceValue !== undefined) {
        target[key] = sourceValue;
      }
    }
  }
  return target;
}
