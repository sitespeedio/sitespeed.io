'use strict';

const path = require('path'),
  flatten = require('../../support/flattenMessage'),
  merge = require('lodash.merge'),
  filterRegistry = require('../../support/filterRegistry');

  const defaultConfig = {
    list: false,
    filterList: false
  }

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    this.options = merge({}, defaultConfig, options.metrics);
    this.metrics = {};
    this.storageManager = context.storageManager;
  },
  postOpen() {
    if (this.options.filter) {

      const filters = Array.isArray(this.options.filter) ? this.options.filter : [this.options.filter];

      for (let metric of filters) {
        // for all filters
        // cleaning all filters means (right now) that all
        // metrics are sent
        if (metric === '*+') {
          filterRegistry.clearAll();
        }
        // all registred types will be set as unmatching,
        // use it if you want to have a clean filter where
        // all types are removed and then you can add your own
        else if(metric === '*-') {
          let types = filterRegistry.getTypes();
          filterRegistry.clearAll();
          for (let type of types) {
            filterRegistry.registerFilterForType('-', type);
          }
        }
        else {
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

  },
  processMessage(message) {
    if (this.options.list) {
      if (!(message.type.endsWith('.summary') || message.type.endsWith('.pageSummary') || message.type.endsWith('assets.largest')))
        return;
      let flattenMess = flatten.flattenMessageData(message);
      for (let key of Object.keys(flattenMess)) {
        this.metrics[message.type + '.' + key] = 1;
      }
    } else {
      return
    }
  },
  close() {
    if (this.options.list) {
      this.storageManager.writeData('metrics.txt', Object.keys(this.metrics).join('\n'));
    }

    if (this.options.filterList) {
      let output = '';
      let filtersByType = filterRegistry.getFilters();
      for (let type of Object.keys(filtersByType)) {
        for (let filters of filtersByType[type]) {
            output+= type + '.' + filters + '\n';
        }
      }
      return this.storageManager.writeData('configuredMetrics.txt', output);
    }
  },
  config: defaultConfig
};
