'use strict';

var assert = require('assert'),
	util = require('../../lib/util/util');

describe('util', function() {

	describe('#getContentType', function() {

		it('text/plain should be categorized as doc', function() {
			var result = util.getContentType('text/plain');
			assert.deepEqual(result, 'doc');
		});

		it('text/html should be categorized as doc', function() {
			var result = util.getContentType('text/html');
			assert.deepEqual(result, 'doc');
		});

		it('text/html; charset=utf-8 with charset should be categorized as doc', function() {
			var result = util.getContentType('text/html; charset=utf-8');
			assert.deepEqual(result, 'doc');
		});

		it('text/javascript should be categorized as js', function() {
			var result = util.getContentType('text/javascript');
			assert.deepEqual(result, 'js');
		});

		it('application/x-javascript; charset=utf-8 should be categorized as js', function() {
			var result = util.getContentType('application/x-javascript; charset=utf-8');
			assert.deepEqual(result, 'js');
		});

		it('text/css should be categorized as css', function() {
			var result = util.getContentType('text/css');
			assert.deepEqual(result, 'css');
		});

		it('image/png should be categorized as image', function() {
			var result = util.getContentType('image/png');
			assert.deepEqual(result, 'image');
		});

		it('image/jpg should be categorized as image', function() {
			var result = util.getContentType('image/jpg');
			assert.deepEqual(result, 'image');
		});

		it('image/gif should be categorized as image', function() {
			var result = util.getContentType('image/gif');
			assert.deepEqual(result, 'image');
		});

		it('image/x-icon should be categorized as image', function() {
			var result = util.getContentType('image/x-icon');
			assert.deepEqual(result, 'image');
		});

		it('image/svg+xml should be categorized as image', function() {
			var result = util.getContentType('image/svg+xml');
			assert.deepEqual(result, 'image');
		});

		it('image/webp should be categorized as image', function() {
			var result = util.getContentType('image/webp');
			assert.deepEqual(result, 'image');
		});


		it('application/font-woff should be categorized as font', function() {
			var result = util.getContentType('application/font-woff');
			assert.deepEqual(result, 'font');
		});

		it('application/font-sfnt should be categorized as font', function() {
			var result = util.getContentType('application/font-sfnt');
			assert.deepEqual(result, 'font');
		});

		it('application/x-font-opentype should be categorized as font', function() {
			var result = util.getContentType('application/x-font-opentype');
			assert.deepEqual(result, 'font');
		});

		it('application/x-font-ttf should be categorized as font', function() {
			var result = util.getContentType('application/x-font-ttf');
			assert.deepEqual(result, 'font');
		});

		it('application/x-shockwave-flash should be categorized as flash', function() {
			var result = util.getContentType('application/x-shockwave-flash');
			assert.deepEqual(result, 'flash');
		});

		it('application/my-own-type should be categorized as unkown', function() {
			var result = util.getContentType('application/my-own-type');
			assert.deepEqual(result, 'unknown');
		});

	});

	describe('#getGraphiteURLKey', function() {

		it('A domain without slash should return protocol.www_domain_com ', function() {
			var result = util.getGraphiteURLKey('https://www.sitespeed.io');
			assert.deepEqual(result, 'http.www_sitespeed_io.slash');
		});

		it('A https domain should start with https in the keys', function() {
			var result = util.getGraphiteURLKey('https://www.sitespeed.io');
			assert.deepEqual(result, 'https.www_sitespeed_io.slash');
		});

		it('A domain with a slash should return protocol.www_domain_com', function() {
			var result = util.getGraphiteURLKey('https://www.sitespeed.io/');
			assert.deepEqual(result, 'http.www_sitespeed_io.slash');
		});

		it('Many subdomains should keep all domains in the domain part of the key', function() {
			var result = util.getGraphiteURLKey('http://so.many.subdomains.sitespeed.io/hepp');
			assert.deepEqual(result, 'http.so_many_subdomains_sitespeed_io._hepp');
		});

		it('The path should be separated from the domain (ending without a slash)', function() {
			var result = util.getGraphiteURLKey('https://www.sitespeed.io/too/deep');
			assert.deepEqual(result, 'http.www_sitespeed_io._too_deep');
		});

		it('The path should be separated from the domain (ends with a slash)', function() {
			var result = util.getGraphiteURLKey('https://www.sitespeed.io/too/deep/');
			assert.deepEqual(result, 'http.www_sitespeed_io._too_deep_');
		});

		it('The path and files should be separated from the domain (when a file is in a folder)', function() {
			var result = util.getGraphiteURLKey('https://www.sitespeed.io/js/my.js');
			assert.deepEqual(result, 'http.www_sitespeed_io._js_my_js');
		});

		it('The path and files should be separated from the domain (when the file is in root)', function() {
			var result = util.getGraphiteURLKey('https://www.sitespeed.io/image.gif');
			assert.deepEqual(result, 'http.www_sitespeed_io._image_gif');
		});

		it('Should escape pipes that make graphite data retrieval problematic', function() {
			var result = util.getGraphiteURLKey('http://www.example.com/browse|ID|4.html');
			assert.deepEqual(result, 'http.www_example_com._browse_ID_4_html');
		});

		it('Should escape encoded pipe characters that make graphite data retrieval problematic', function() {
			var result = util.getGraphiteURLKey('http://www.example.com/browse%7CID%7C4.html');
			assert.deepEqual(result, 'http.www_example_com._browse_ID_4_html');
		});

		it('Should escape "+" that make graphite data retrieval problematic', function() {
			var result = util.getGraphiteURLKey('http://www.example.com/browse/hello+world');
			assert.deepEqual(result, 'http.www_example_com._browse_hello_world');
		});

		it('Should escape "," (comma) that makes graphite functions fail', function() {
			var result = util.getGraphiteURLKey('http://www.example.com/browse/hello,world');
			assert.deepEqual(result, 'http.www_example_com._browse_hello_world');
		});

	});
});
