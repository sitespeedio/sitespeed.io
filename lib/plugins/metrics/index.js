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

      let metricsArray = Array.isArray(this.options.metrics.filter) ? this.options.metrics.filter : [this.options.metrics.filter];

      for (let metric of metricsArray) {
        // for all filters
        if (metric === '*+') {
          filterRegistry.clearAll();
        }
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
          if (oldFilter && oldFilter.isArray) {
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
    if (!(message.type.endsWith('.summary') || message.type.endsWith('.pageSummary')))
      return;

    let flattenMess = flatten.flattenMessageData(message);
    for (let key of Object.keys(flattenMess)) {
      this.metrics[message.type + '.' + key] = 1;
    }

  },
  close() {
    if (this.options.metrics && this.options.metrics.list) {
      this.storageManager.writeData('metrics.txt', Object.keys(this.metrics).join('\n'));
    }

    if (this.options.metrics && this.options.metrics.filter && this.options.metrics.filter.list) {
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
