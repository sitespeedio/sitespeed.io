'use strict';

const StorageManager = require('../lib/support/storageManager'),
  os = require('os'),
  moment = require('moment'),
  expect = require('chai').expect;

function createManager(url) {
  return new StorageManager(url, moment(), {resultBaseDir: os.tmpdir()});
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

  describe('#pathFromRootToPageDir', function() {
    it('should create path from site root', function() {
      const storageManager = createManager('http://www.foo.bar');
      const path = storageManager.pathFromRootToPageDir('http://www.foo.bar');
      expect(path).to.equal('pages/www.foo.bar/');
    });

    it('should create path from url', function() {
      const storageManager = createManager('http://www.foo.bar');
      const path = storageManager.pathFromRootToPageDir('http://www.foo.bar/x/y/z.html');
      expect(path).to.equal('pages/www.foo.bar/x/y/z.html/');
    });

    it('should create path from url with query string', function() {
      const storageManager = createManager('http://www.foo.bar');
      const path = storageManager.pathFromRootToPageDir('http://www.foo.bar/x/y/z?foo=bar');
      expect(path).to.equal('pages/www.foo.bar/x/y/z/query-115ffe20/');
    });

  });
});
