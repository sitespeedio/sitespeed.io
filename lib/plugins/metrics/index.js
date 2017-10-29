'use strict';

const flatten = require('../../support/flattenMessage');
const merge = require('lodash.merge');

const defaultConfig = {
  list: false,
  filterList: false
};

module.exports = {
  open(context, options) {
    this.options = merge({}, defaultConfig, options.metrics);
    this.metrics = {};
    this.storageManager = context.storageManager;
    this.filterRegistry = context.filterRegistry;
  },
  processMessage(message) {
    const filterRegistry = this.filterRegistry;
    // only dance if we all wants to
    if (this.options.filter) {
      if (message.type === 'sitespeedio.setup') {
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
    }
    if (message.type === 'sitespeedio.render') {
      if (this.options.list) {
        this.storageManager.writeData(
          'metrics.txt',
          Object.keys(this.metrics).join('\n')
        );
      }
      if (this.options.filterList) {
        let output = '';
        let filtersByType = filterRegistry.getFilters();
        for (let type of Object.keys(filtersByType)) {
          for (let filters of filtersByType[type]) {
            output += type + '.' + filters + '\n';
          }
        }
        return this.storageManager.writeData('configuredMetrics.txt', output);
      }
    } else if (
      !(
        message.type.endsWith('.summary') ||
        message.type.endsWith('.pageSummary')
      )
    ) {
      return;
    } else {
      let flattenMess = flatten.flattenMessageData(message);
      for (let key of Object.keys(flattenMess)) {
        this.metrics[message.type + '.' + key] = 1;
      }
    }
  },
  config: defaultConfig
};
