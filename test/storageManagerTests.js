'use strict';

const resultsStorage = require('../lib/core/resultsStorage');
const moment = require('moment');
const path = require('path');
const expect = require('chai').expect;

const timestamp = moment();
const timestampString = timestamp.format('YYYY-MM-DD-HH-mm-ss');

function createManager(url, outputFolder) {
  return resultsStorage(url, timestamp, outputFolder).storageManager;
}

describe('storageManager', function() {
  describe('#rootPathFromUrl', function() {
    it('should create path from url', function() {
      const storageManager = createManager('http://www.foo.bar');
      const path = storageManager.rootPathFromUrl(
        'http://www.foo.bar/x/y/z.html'
      );
      expect(path).to.equal('../../../../../');
    });

    it('should create path from url with query string', function() {
      const storageManager = createManager('http://www.foo.bar');
      const path = storageManager.rootPathFromUrl(
        'http://www.foo.bar/x/y/z?foo=bar'
      );
      expect(path).to.equal('../../../../../../');
    });
  });

  describe('#getBaseDir', function() {
    it('should create base dir with default output folder', function() {
      const storageManager = createManager('http://www.foo.bar');
      expect(storageManager.getBaseDir()).to.equal(
        path.resolve('sitespeed-result', 'www.foo.bar', timestampString)
      );
    });
    it('should create base dir with custom output folder', function() {
      const storageManager = createManager(
        'http://www.foo.bar',
        '/tmp/sitespeed.io/foo'
      );
      expect(storageManager.getBaseDir()).to.equal('/tmp/sitespeed.io/foo');
    });
  });

  describe('#getStoragePrefix', function() {
    it('should create prefix with default output folder', function() {
      const storageManager = createManager('http://www.foo.bar');
      expect(storageManager.getStoragePrefix()).to.equal(
        path.join('www.foo.bar', timestampString)
      );
    });
    it('should create prefix with custom output folder', function() {
      const storageManager = createManager(
        'http://www.foo.bar',
        '/tmp/sitespeed.io/foo'
      );
      expect(storageManager.getStoragePrefix()).to.equal('foo');
    });
  });
});
