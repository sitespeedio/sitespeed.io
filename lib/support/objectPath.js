const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const INDEX_RE = /^(?:0|[1-9]\d*)$/;

function toPath(path) {
  if (Array.isArray(path)) return path;
  return String(path).split('.');
}

function isNullish(value) {
  return value === undefined || value === null;
}

function looksLikeArrayIndex(segment) {
  return INDEX_RE.test(String(segment));
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
      current[segment] = looksLikeArrayIndex(segments[i + 1]) ? [] : {};
    }
    current = current[segment];
  }
  const last = segments.at(-1);
  if (!FORBIDDEN_KEYS.has(last)) {
    current[last] = value;
  }
  return object;
}
