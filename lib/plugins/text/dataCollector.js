'use strict';

const merge = require('lodash.merge');

class DataCollector {
  constructor() {
    this.data = {};
  }

  get() {
    return this.data;
  }

  add(data) {
    merge(this.data, data);
  }
}

module.exports = DataCollector;
