import { default as _get } from 'lodash.get';

export function get(object, property, defaultValue) {
  if (arguments.length < 3) {
    defaultValue = 0;
  }
  if (!object) {
    return defaultValue;
  }
  return _get(object, property, defaultValue);
}
