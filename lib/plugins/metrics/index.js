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

      for (let metric of this.options.metrics.filter) {
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

    // remove all HAR entries, because we shouldn't flatten them
    // lets look at a better way to do this.
    if (message.type === 'browsertime.pageSummary') {
      for (var run of message.data.browserScripts) {
          delete run.har;
      }
    }
    let flattenMess = flatten.flattenMessageData(message);
    for (let key of Object.keys(flattenMess)) {
      this.metrics[message.type + '.' + key] = 1;
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
