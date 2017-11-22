'use strict';

const resultsStorage = require('../lib/core/resultsStorage');
const moment = require('moment');
const expect = require('chai').expect;

const timestamp = moment();
const timestampString = timestamp.format('YYYY-MM-DD-HH-mm-ss');

function createResultUrls(url, outputFolder, resultBaseURL) {
  return resultsStorage(url, timestamp, outputFolder, resultBaseURL).resultUrls;
}

describe('resultUrls', function() {
  describe('#hasBaseUrl', function() {
    it('should be false if base url is missing', function() {
      const resultUrls = createResultUrls(
        'http://www.foo.bar',
        undefined,
        undefined
      );
      expect(resultUrls.hasBaseUrl()).to.be.false;
    });

    it('should be true if base url is present', function() {
      const resultUrls = createResultUrls(
        'http://www.foo.bar',
        undefined,
        'http://results.com'
      );
      expect(resultUrls.hasBaseUrl()).to.be.true;
    });
  });

  describe('#reportSummaryUrl', function() {
    it('should create url with default output folder', function() {
      const resultUrls = createResultUrls(
        'http://www.foo.bar',
        undefined,
        'http://results.com'
      );
      expect(resultUrls.reportSummaryUrl()).to.equal(
        `http://results.com/www.foo.bar/${timestampString}`
      );
    });
    it('should create url with absolute output folder', function() {
      const resultUrls = createResultUrls(
        'http://www.foo.bar',
        '/root/leaf',
        'http://results.com'
      );
      expect(resultUrls.reportSummaryUrl()).to.equal('http://results.com/leaf');
    });
    it('should create url with relative output folder', function() {
      const resultUrls = createResultUrls(
        'http://www.foo.bar',
        '../leaf',
        'http://results.com'
      );
      expect(resultUrls.reportSummaryUrl()).to.equal('http://results.com/leaf');
    });
  });
  describe('#absoluteSummaryPageUrl', function() {
    it('should create url with default output folder', function() {
      const resultUrls = createResultUrls(
        'http://www.foo.bar',
        undefined,
        'http://results.com'
      );
      expect(
        resultUrls.absoluteSummaryPageUrl('http://www.foo.bar/xyz')
      ).to.equal(
        `http://results.com/www.foo.bar/${
          timestampString
        }/pages/www.foo.bar/xyz/`
      );
    });
    it('should create url with absolute output folder', function() {
      const resultUrls = createResultUrls(
        'http://www.foo.bar',
        '/root/leaf',
        'http://results.com'
      );
      expect(
        resultUrls.absoluteSummaryPageUrl('http://www.foo.bar/xyz')
      ).to.equal('http://results.com/leaf/pages/www.foo.bar/xyz/');
    });
    it('should create url with relative output folder', function() {
      const resultUrls = createResultUrls(
        'http://www.foo.bar',
        '../leaf',
        'http://results.com'
      );
      expect(
        resultUrls.absoluteSummaryPageUrl('http://www.foo.bar/xyz')
      ).to.equal('http://results.com/leaf/pages/www.foo.bar/xyz/');
    });
  });
  describe('#relativeSummaryPageUrl', function() {
    it('should create url with default output folder', function() {
      const resultUrls = createResultUrls(
        'http://www.foo.bar',
        undefined,
        'http://results.com'
      );
      expect(
        resultUrls.relativeSummaryPageUrl('http://www.foo.bar/xyz')
      ).to.equal('pages/www.foo.bar/xyz/');
    });
    it('should create url with absolute output folder', function() {
      const resultUrls = createResultUrls(
        'http://www.foo.bar',
        '/root/leaf',
        'http://results.com'
      );
      expect(
        resultUrls.relativeSummaryPageUrl('http://www.foo.bar/xyz')
      ).to.equal('pages/www.foo.bar/xyz/');
    });
    it('should create url with relative output folder', function() {
      const resultUrls = createResultUrls(
        'http://www.foo.bar',
        '../leaf',
        'http://results.com'
      );
      expect(
        resultUrls.relativeSummaryPageUrl('http://www.foo.bar/xyz')
      ).to.equal('pages/www.foo.bar/xyz/');
    });
  });
});
