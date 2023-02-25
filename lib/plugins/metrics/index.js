import merge from 'lodash.merge';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import { flattenMessageData } from '../../support/flattenMessage.js';

const defaultConfig = {
  list: false,
  filterList: false
};

export default class MetricsPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'metrics', options, context, queue });
  }

  open(context, options) {
    this.options = merge({}, defaultConfig, options.metrics);
    this.metrics = {};
    this.storageManager = context.storageManager;
    this.filterRegistry = context.filterRegistry;
  }

  processMessage(message) {
    const filterRegistry = this.filterRegistry;

    if (message.type === 'sitespeedio.render' && this.options.list) {
      // Ooops we should take care of promise
      this.storageManager.writeData(
        Object.keys(this.metrics).join('\n'),
        'metrics.txt'
      );
    }

    if (message.type === 'sitespeedio.render' && this.options.filterList) {
      let output = '';
      let filtersByType = filterRegistry.getFilters();
      for (let type of Object.keys(filtersByType)) {
        for (let filters of filtersByType[type]) {
          output += type + '.' + filters + '\n';
        }
      }
      return this.storageManager.writeData(output, 'configuredMetrics.txt');
    }

    // only dance if we all wants to
    if (this.options.filter && message.type === 'sitespeedio.setup') {
      const filters = Array.isArray(this.options.filter)
        ? this.options.filter
        : [this.options.filter];

      for (let metric of filters) {
        // for all filters
        // cleaning all filters means (right now) that all
        // metrics are sent
        if (metric === '*+') {
          filterRegistry.clearAll();
        } else if (metric === '*-') {
          // all registered types will be set as unmatching,
          // use it if you want to have a clean filter where
          // all types are removed and then you can add your own
          let types = filterRegistry.getTypes();
          filterRegistry.clearAll();
          for (let type of types) {
            filterRegistry.registerFilterForType('-', type);
          }
        } else {
          let parts = metric.split('.');
          // the type is "always" the first two
          let type = parts.shift() + '.' + parts.shift();
          let filter = parts.join('.');
          let oldFilter = filterRegistry.getFilterForType(type);
          if (oldFilter && typeof oldFilter === 'object') {
            oldFilter.push(filter);
          } else {
            oldFilter = [filter];
          }
          filterRegistry.registerFilterForType(oldFilter, type);
        }
      }
    }

    if (this.options.list) {
      if (
        !(
          message.type.endsWith('.summary') ||
          message.type.endsWith('.pageSummary') ||
          message.type.endsWith('.run')
        )
      ) {
        return;
      }
      let flattenMess = flattenMessageData(message);
      for (let key of Object.keys(flattenMess)) {
        this.metrics[message.type + '.' + key] = 1;
      }
    }
  }
}
export const config = defaultConfig;
