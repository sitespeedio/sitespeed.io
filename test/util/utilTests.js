'use strict';

var assert = require('assert'),
	util = require('../../lib/util/util');

describe('util', function() {

	describe('#getContentType', function() {

		it('text/plain should be categorized as doc', function() {
			var result = util.getContentType('text/plain');
			assert.deepEqual('doc', result);
		});

		it('text/html should be categorized as doc', function() {
			var result = util.getContentType('text/html');
			assert.deepEqual('doc', result);
		});

		it('text/html; charset=utf-8 with charset should be categorized as doc', function() {
			var result = util.getContentType('text/html; charset=utf-8');
			assert.deepEqual('doc', result);
		});

		it('text/javascript should be categorized as js', function() {
			var result = util.getContentType('text/javascript');
			assert.deepEqual('js', result);
		});

		it('application/x-javascript; charset=utf-8 should be categorized as js', function() {
			var result = util.getContentType('application/x-javascript; charset=utf-8');
			assert.deepEqual('js', result);
		});

		it('text/css should be categorized as css', function() {
			var result = util.getContentType('text/css');
			assert.deepEqual('css', result);
		});

		it('image/png should be categorized as image', function() {
			var result = util.getContentType('image/png');
			assert.deepEqual('image', result);
		});

		it('image/jpg should be categorized as image', function() {
			var result = util.getContentType('image/jpg');
			assert.deepEqual('image', result);
		});

		it('image/gif should be categorized as image', function() {
			var result = util.getContentType('image/gif');
			assert.deepEqual('image', result);
		});

		it('image/x-icon should be categorized as image', function() {
			var result = util.getContentType('image/x-icon');
			assert.deepEqual('image', result);
		});

		it('image/svg+xml should be categorized as image', function() {
			var result = util.getContentType('image/svg+xml');
			assert.deepEqual('image', result);
		});

		it('image/webp should be categorized as image', function() {
			var result = util.getContentType('image/webp');
			assert.deepEqual('image', result);
		});


		it('application/font-woff should be categorized as font', function() {
			var result = util.getContentType('application/font-woff');
			assert.deepEqual('font', result);
		});

		it('application/font-sfnt should be categorized as font', function() {
			var result = util.getContentType('application/font-sfnt');
			assert.deepEqual('font', result);
		});

		it('application/x-font-opentype should be categorized as font', function() {
			var result = util.getContentType('application/x-font-opentype');
			assert.deepEqual('font', result);
		});

		it('application/x-font-ttf should be categorized as font', function() {
			var result = util.getContentType('application/x-font-ttf');
			assert.deepEqual('font', result);
		});

		it('application/x-shockwave-flash should be categorized as flash', function() {
			var result = util.getContentType('application/x-shockwave-flash');
			assert.deepEqual('flash', result);
		});

		it('application/my-own-type should be categorized as unkown', function() {
			var result = util.getContentType('application/my-own-type');
			assert.deepEqual('unknown', result);
		});

	});

});
