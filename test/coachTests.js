'use strict';

const aggregator = require('../lib/plugins/coach/aggregator'),
  fs = require('fs'),
  path = require('path'),
  expect = require('chai').expect;

const coachRunPath = path.resolve(__dirname, 'fixtures', 'coach.run-0.json');
const coachRun = JSON.parse(fs.readFileSync(coachRunPath, 'utf8'));

describe('coach', function() {
  describe('aggregator', function() {
    it('should summarize data', function() {
      aggregator.addToAggregate(coachRun, 'www.sitespeed.io');

      expect(aggregator.summarize()).to.not.be.empty;
    });
  });
});
