'use strict';

const plugin = require('../lib/plugins/webpagetest');
const aggregator = require('../lib/plugins/webpagetest/aggregator');
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const messageMaker = require('../lib/support/messageMaker');
const filterRegistry = require('../lib/support/filterRegistry');

const wptResultPath = path.resolve(
  __dirname,
  'fixtures',
  'webpagetest.data.json'
);
const wptResult = JSON.parse(fs.readFileSync(wptResultPath, 'utf8'));

describe('webpagetest', () => {
  const context = { messageMaker, filterRegistry };

  describe('plugin', () => {
    it('should require key for default server', () => {
      expect(() => plugin.open(context, {})).to.throw();
    });
    it('should require key for public server', () => {
      expect(() =>
        plugin.open(context, { webpagetest: { host: 'www.webpagetest.org' } })
      ).to.throw();
    });
    it('should not require key for private server', () => {
      expect(() =>
        plugin.open(context, { webpagetest: { host: 'http://myserver.foo' } })
      ).to.not.throw();
    });
  });

  describe('aggregator', () => {
    it('should summarize data', () => {
      aggregator.addToAggregate(
        'www.sitespeed.io',
        wptResult,
        'native',
        'Test',
        { video: true }
      );

      expect(aggregator.summarize()).to.not.be.empty;
    });
  });
});
