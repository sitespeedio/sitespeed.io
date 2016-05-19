'use strict';

const DataGenerator = require('../lib/plugins/influxdb/data-generator'),
  expect = require('chai').expect;

describe('influxdb', function() {
  describe('dataGenerator', function() {
    it('should generate data for gpsi.pageSummary', function() {
      const message = {
        "type": "gpsi.pageSummary",
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
        },
        'url': 'http://sub.domain.com/foo/bar'
      };

      let generator = new DataGenerator();

      var data = generator.dataFromMessage(message);

      expect(data).to.not.be.empty;

      const firstName = data[0].seriesName;

      expect(firstName).to.match(/pageSummary.sub_domain_com/);
      expect(firstName).to.match(/foo_bar.gpsi.median/);
    });
  });
});
