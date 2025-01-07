import { filterMetrics } from './metricsFilter.js';

let filterForType = {};

export function registerFilterForType(filter, type) {
  filterForType[type] = filter;
}
export function getFilterForType(type) {
  return filterForType[type];
}
export function addFilterForType(filter, type) {
  const filters = filterForType[type];
  if (!filters.includes(filter)) {
    filterForType[type].push(filter);
  }
}
export function getFilters() {
  return filterForType;
}
export function getTypes() {
  return Object.keys(filterForType);
}
export function removeFilter(type) {
  filterForType[type] = undefined;
}
export function clearAll() {
  filterForType = {};
}
export function filterMessage(message) {
  const filterConfig = this.getFilterForType(message.type);

  if (!filterConfig) {
    return message;
  }

  return {
    ...message,
    data: filterMetrics(message.data, filterConfig)
  };
}
