'use strict';

const DataGenerator = require('../lib/plugins/graphite/data-generator'),
  expect = require('chai').expect,
  moment = require('moment');

describe('graphite', function() {
  describe('dataGenerator', function() {
    it('should generate data for gpsi.pageSummary', function() {
      const message = {
        type: 'gpsi.pageSummary',
        timestamp: '2016-01-08T12:59:06+01:00',
        source: 'gpsi',
        data: {
          median: '13',
          mean: '14.42',
          min: '13',
          p10: '13',
          p70: '16',
          p80: '16',
          p90: '16',
          p99: '16',
          max: '16'
        },
        url: 'http://sub.domain.com/foo/bar'
      };

      let generator = new DataGenerator('ns', false, {
        _: ['filename'],
        browser: 'chrome',
        connectivity: 'cable'
      });

      var data = generator.dataFromMessage(message, moment());
      expect(data).to.match(/ns.pageSummary.sub_domain_com/);
      expect(data).to.match(/bar.gpsi.median/);
      expect(data).to.match(/foo_bar/);
    });

    it('should generate data for domains.summary', function() {
      const message = {
        type: 'domains.summary',
        timestamp: '2016-01-08T12:59:06+01:00',
        source: 'domains',
        data: {
          'www.sitespeed.io': {
            dns: {
              median: '0',
              mean: '13',
              min: '0',
              p10: '0',
              p90: '40',
              p99: '40',
              max: '40'
            }
          }
        },
        group: 'sub_domain_com'
      };

      let generator = new DataGenerator('ns', false, {
        _: ['sub_domain_com'],
        browser: 'chrome',
        connectivity: 'cable'
      });
      var data = generator.dataFromMessage(message, moment());
      expect(data).to.match(
        /ns.summary.sub_domain_com.chrome.cable.domains.www.sitespeed.io.dns.median/
      );
    });
  });
});
