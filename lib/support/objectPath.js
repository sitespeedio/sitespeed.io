function toPath(path) {
  if (Array.isArray(path)) return path;
  return String(path).split('.');
}

function isNullish(value) {
  return value === undefined || value === null;
}

export function get(object, path, defaultValue) {
  let current = object;
  for (const segment of toPath(path)) {
    if (isNullish(current)) return defaultValue;
    current = current[segment];
  }
  return current === undefined ? defaultValue : current;
}
