import { get as _get } from '../objectPath.js';

export function get(object, property, defaultValue) {
  if (arguments.length < 3) {
    defaultValue = 0;
  }
  if (!object) {
    return defaultValue;
  }
  return _get(object, property, defaultValue);
}
