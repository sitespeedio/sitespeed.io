'use strict';

const path = require('path'),
  flatten = require('../../support/flattenMessage'),
  filterRegistry = require('../../support/filterRegistry');

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    this.options = options;
    this.metrics = {};
    this.storageManager = context.storageManager;
  },
  postOpen() {
    if (this.options.metrics && this.options.metrics.filter) {

      const filters = Array.isArray(this.options.metrics.filter) ? this.options.metrics.filter : [this.options.metrics.filter];

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
    if (this.options.metrics && this.options.metrics.list) {
      if (!(message.type.endsWith('.summary') || message.type.endsWith('.pageSummary')))
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
    if (this.options.metrics && this.options.metrics.list) {
      this.storageManager.writeData('metrics.txt', Object.keys(this.metrics).join('\n'));
    }

    if (this.options.metrics && this.options.metrics.filterList) {
      let output = '';
      let filtersByType = filterRegistry.getFilters();
      for (let type of Object.keys(filtersByType)) {
        for (let filters of filtersByType[type]) {
            output+= type + '.' + filters + '\n';
        }
      }
      return this.storageManager.writeData('configuredMetrics.txt', output);
    }
  }
};
