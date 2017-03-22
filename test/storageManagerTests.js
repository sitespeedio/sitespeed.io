'use strict';

const resultsStorage = require('../lib/support/resultsStorage');
const moment = require('moment');
const expect = require('chai').expect;

function createManager(url, outputFolder) {
  return resultsStorage(url, moment(), outputFolder).storageManager;
}

describe('storageManager', function() {
  describe('#rootPathFromUrl', function() {
    it('should create path from url', function() {
      const storageManager = createManager('http://www.foo.bar');
      const path = storageManager.rootPathFromUrl('http://www.foo.bar/x/y/z.html');
      expect(path).to.equal('../../../../../');
    });

    it('should create path from url with query string', function() {
      const storageManager = createManager('http://www.foo.bar');
      const path = storageManager.rootPathFromUrl('http://www.foo.bar/x/y/z?foo=bar');
      expect(path).to.equal('../../../../../../');
    });
  });

  describe('#getStoragePrefix', function() {
    it('should create path from url', function() {
      const storageManager = createManager('http://www.foo.bar', '/tmp/sitespeed.io/foo');
      expect(storageManager.getStoragePrefix()).to.equal('foo');
    });
  });
});
