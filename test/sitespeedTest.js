'use strict';

var assert = require('assert'),
	Sitespeed = require('../lib/sitespeed');

describe('sitespeed', function() {

	describe('#run', function() {

		var sitespeed = new Sitespeed();

		it('should get error when passed incorrect configuration', function(done) {
      sitespeed.run({}, function(err, result) {
        err.should.exist;
				done();
			});
		});


		it('should get a result', function(done) {
      sitespeed.run({
				url: 'https://www.sitespeed.io',
				deep: 0
			}, function(err, result) {
        result.should.exist;
				done();
			});
		});


	});

});
