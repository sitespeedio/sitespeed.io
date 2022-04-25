'use strict';

const DataGenerator = require('../lib/plugins/graphite/data-generator');
const test = require('ava');
const dayjs = require('dayjs');

test(`Test dataGenerator`, t => {
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
  t.true(
    data[0].startsWith(
      'ns.pageSummary.sub_domain_com._foo_bar.gpsi.desktop.median 13'
    )
  );
});

test(`Test generate data in statsD format`, t => {
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

  const statsDFormat = new RegExp(
    /ns.summary.sub_domain_com.chrome.cable.domains.www.sitespeed.io.dns.(median|mean|min|p10|p90|p99|max):[\d]{1,}\|ms$/
  );
  for (let line of data) {
    t.true(statsDFormat.test(line));
  }
});

test(`Use graphite interface by default`, t => {
  const plugin = require('../lib/plugins/graphite');
  const options = {
    graphite: {
      host: '127.0.0.1'
    }
  };
  const messageMaker = require('../lib/support/messageMaker');
  const filterRegistry = require('../lib/support/filterRegistry');
  const intel = require('intel');
  const statsHelpers = require('../lib/support/statsHelpers');
  const context = { messageMaker, filterRegistry, intel, statsHelpers };

  plugin.open(context, options);
  console.log(plugin.sender.facility);
  t.is(plugin.sender.facility, 'Graphite');
});
