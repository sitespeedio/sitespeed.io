'use strict';

let aggregator = require('../lib/plugins/domains/aggregator'),
  fs = require('fs'),
  path = require('path'),
  Promise = require('bluebird'),
  expect = require('chai').expect;

Promise.promisifyAll(fs);

describe('domains', function() {
  describe('aggregator', function() {
    let har;

    beforeEach(function() {
      return fs
        .readFileAsync(
          path.resolve(__dirname, 'fixtures', 'www-theverge-com.har'),
          'utf8'
        )
        .then(JSON.parse)
        .tap(data => {
          har = data;
        });
    });

    describe('#addToAggregate', function() {
      it('should add har to aggregate', function() {
        aggregator.addToAggregate(har, 'http://www.vox.com');
        const summary = aggregator.summarize();
        const voxDomain = summary.groups.total['cdn1.vox-cdn.com'];
        expect(voxDomain).to.have.nested.property('connect.max', 11);
      });
    });
  });
});
