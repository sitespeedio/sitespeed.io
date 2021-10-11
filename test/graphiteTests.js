'use strict';

const DataGenerator = require('../lib/plugins/graphite/data-generator'),
  expect = require('chai').expect,
  dayjs = require('dayjs');

describe('graphite', function () {
  describe('dataGenerator', function () {
    it('should generate data for gpsi.pageSummary', function () {
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
        browsertime: {
          connectivity: {
            profile: 'cable'
          }
        }
      });

      const data = generator.dataFromMessage(message, dayjs());
      expect(data).to.match(/ns.pageSummary.sub_domain_com/);
      expect(data).to.match(/bar.gpsi.desktop.median/);
      expect(data).to.match(/foo_bar/);
    });

    it('should generate data for domains.summary', function () {
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
        browsertime: {
          connectivity: {
            profile: 'cable'
          }
        }
      });
      const data = generator.dataFromMessage(message, dayjs());

      expect(data).to.match(
        /ns.summary.sub_domain_com.chrome.cable.domains.www.sitespeed.io.dns.median [\d]{1,} [\d]*/
      );
    });

    it('should generate data in statsD format', function () {
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
        browsertime: {
          connectivity: {
            profile: 'cable'
          }
        },
        graphite: { statsd: true }
      });
      const data = generator.dataFromMessage(message, dayjs());

      data.forEach(function (line) {
        expect(line).to.match(
          /ns.summary.sub_domain_com.chrome.cable.domains.www.sitespeed.io.dns.(median|mean|min|p10|p90|p99|max):[\d]{1,}\|ms$/
        );
      });
    });
  });

  describe('index', function () {
    const messageMaker = require('../lib/support/messageMaker');
    const filterRegistry = require('../lib/support/filterRegistry');
    const intel = require('intel');
    const statsHelpers = require('../lib/support/statsHelpers');
    const context = { messageMaker, filterRegistry, intel, statsHelpers };
    let plugin;
    let options;

    beforeEach(function () {
      plugin = require('../lib/plugins/graphite');
      options = {
        graphite: {
          host: '127.0.0.1'
        }
      };
    });

    it('Should use graphite interface by default', function () {
      plugin.open(context, options);

      expect(plugin.sender.facility).to.match(/graphite/i);
    });

    it('Should use statsd interface', function () {
      Object.assign(options.graphite, {
        statsd: true
      });

      plugin.open(context, options);
      expect(plugin.sender.facility).to.match(/statsd/i);
    });

    it('Should use graphite interface by default', function () {
      plugin.open(context, options);

      expect(plugin.sender.facility).to.match(/graphite/i);
    });
  });

  describe('helpers/is-statsd', function () {
    const isStatsD = require('../lib/plugins/graphite/helpers/is-statsd');

    it('Should be set to statsd', function () {
      expect(isStatsD({ statsd: true })).to.be.true;
    });
    it('Should not be set to statsd', function () {
      ['true', 1, null, false, undefined].forEach(
        value => expect(isStatsD({ statsd: value })).to.be.false
      );
    });
  });

  describe('helpers/format-entry', function () {
    const formatEntry = require('../lib/plugins/graphite/helpers/format-entry');

    it('Should retrieve the format of statsd', function () {
      expect(formatEntry('statsd')).to.equal('%s:%s|ms');
    });

    it('Should retrieve the default format of graphite', function () {
      ['StatsD', 'stats', 'graphite', null, false, undefined].forEach(value =>
        expect(formatEntry(value)).to.equal('%s %s %s')
      );
    });
  });

  describe('GraphiteSender', function () {
    const GraphiteSender = require('../lib/plugins/graphite/graphite-sender');
    const net = require('net');
    const { connect } = net;

    afterEach(function () {
      net.connect = connect;
    });

    function mock(fn) {
      net.connect = (host, port, callback) => {
        setTimeout(callback, 0);
        return { write: fn, end: () => null, on: () => null };
      };
    }

    it('Should send data to graphite via net', function (done) {
      mock(() => done());

      const sender = new GraphiteSender('127.0.0.1', '2003');
      sender.send('some.data');
    });

    it('Should send data to graphite in bulks', function (done) {
      let sent = 0;
      mock(() => {
        ++sent === 2 && done();
      });

      const sender = new GraphiteSender('127.0.0.1', '2003', 2);
      sender.send('some.data.1\nmore.data.2\nmore.data.3\nmore.data.4');
    });
  });

  describe('StatsDSender', function () {
    const StatsDSender = require('../lib/plugins/graphite/statsd-sender');
    const dgram = require('dgram');
    const { createSocket } = dgram;

    afterEach(function () {
      dgram.createSocket = createSocket;
    });

    function mock(fn) {
      dgram.createSocket = () => ({ send: fn });
    }

    it('Should send data to statsd via dgram', function () {
      let sent = false;
      mock(() => {
        sent = true;
      });

      const sender = new StatsDSender('127.0.0.1', '8125');
      sender.send('some.data');

      expect(sent).to.be.true;
    });

    it('Should send data to statsd in bulks', function () {
      let sent = 0;
      mock(() => {
        sent++;
      });

      const sender = new StatsDSender('127.0.0.1', '8125', 2);
      sender.send('some.data.1\nmore.data.2\nmore.data.3\nmore.data.4');

      expect(sent).to.equal(2);
    });
  });
});
