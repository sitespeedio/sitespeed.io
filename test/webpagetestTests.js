'use strict';

const aggregator = require('../lib/plugins/webpagetest/aggregator'),
  fs = require('fs'),
  path = require('path'),
  expect = require('chai').expect;

const wptResultPath = path.resolve(__dirname, 'fixtures', 'webpagetest.data.json');
const wptResult = JSON.parse(fs.readFileSync(wptResultPath, 'utf8'));

describe('webpagetest', function() {
  describe('aggregator', function() {
    it('should summarize data', function() {
      aggregator.addToAggregate(wptResult);

      expect(aggregator.summarize()).to.not.be.empty;
    });
  });
});
