'use strict';

const cliUtil = require('../lib/cli/util'),
  expect = require('chai').expect;

describe('cliUtil', function() {
  describe('getURLs', function() {
    it('should extract urls', function() {
      let urls = cliUtil.getURLs(['test/fixtures/sitespeed-urls.txt']);
      expect(urls[0] === 'https://www.sitespeed.io');
      expect(urls[3] === 'https://www.sitespeed.io/documentation/faq');

      urls = cliUtil.getURLs(['test/fixtures/sitespeed-urls-aliases.txt']);
      expect(urls[0] === 'https://www.sitespeed.io');
      expect(urls[3] === 'https://www.sitespeed.io/documentation/faq');
    });
  });
  describe('getAliases', function() {
    it('should extract aliases', function() {
      let aliases = cliUtil.getAliases(['test/fixtures/sitespeed-urls.txt']);
      expect(aliases['https://www.sitespeed.io']).to.be.undefined;
      expect(
        aliases[
          'https://www.sitespeed.io/documentation/sitespeed.io/webpagetest/'
        ]
      ).to.be.undefined;

      aliases = cliUtil.getAliases([
        'test/fixtures/sitespeed-urls-aliases.txt'
      ]);
      expect(aliases['https://www.sitespeed.io'].alias).to.equal('Home_Page');
      expect(
        aliases[
          'https://www.sitespeed.io/documentation/sitespeed.io/webpagetest/'
        ]
      ).to.be.undefined;
    });
  });
});
