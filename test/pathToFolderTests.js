'use strict';

const pathFromRootToPageDir = require('../lib/core/resultsStorage/pathToFolder');
const expect = require('chai').expect;

describe('pathFromRootToPageDir', function() {
  it('should create path from site root', function() {
    const path = pathFromRootToPageDir('http://www.foo.bar', {});
    expect(path).to.equal('pages/www_foo_bar/');
  });

  it('should create path from url', function() {
    const path = pathFromRootToPageDir('http://www.foo.bar/x/y/z.html', {});
    expect(path).to.equal('pages/www_foo_bar/x/y/z.html/');
  });

  it('should create path from url with sanitized characters', function() {
    const path = pathFromRootToPageDir('http://www.foo.bar/x/y/z:200.html', {});
    expect(path).to.equal('pages/www_foo_bar/x/y/z-200.html/');
  });

  it('should create path from url with query string', function() {
    const path = pathFromRootToPageDir('http://www.foo.bar/x/y/z?foo=bar', {});
    expect(path).to.equal('pages/www_foo_bar/x/y/z/query-115ffe20/');
  });
});
