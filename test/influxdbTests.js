'use strict';

const DataGenerator = require('../lib/plugins/influxdb/data-generator'),
  expect = require('chai').expect;

describe('influxdb', function() {
  describe('dataGenerator', function() {
    it('should generate data for gpsi.pageStats', function() {
      const message = {
        "type": "gpsi.pageStats",
        "timestamp": "2016-01-08T12:59:06+01:00",
        "source": "gpsi",
        "data": {
          "median": "13",
          "mean": "14.42",
          "min": "13",
          "p10": "13",
          "p70": "16",
          "p80": "16",
          "p90": "16",
          "p99": "16",
          "max": "16"
        }
      };

      let generator = new DataGenerator('ns');

      expect(generator.dataFromMessage(message)).to.not.be.empty;
    });
  });
});
