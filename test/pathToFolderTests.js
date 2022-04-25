'use strict';

const pathFromRootToPageDir = require('../lib/core/resultsStorage/pathToFolder');
const test = require('ava');

test(`Test pathFromRootToPageDir should create path from site root`, t => {
  const path = pathFromRootToPageDir('http://www.foo.bar', {});
  t.is(path, 'pages/www_foo_bar/', 'should create path from site root');
});

test(`Test pathFromRootToPageDir should create path from url`, t => {
  const path = pathFromRootToPageDir('http://www.foo.bar/x/y/z.html', {});
  t.is(path, 'pages/www_foo_bar/x/y/z.html/', 'should create path from url');
});

test(`Test pathFromRootToPageDir should create path from url with sanitized characters`, t => {
  const path = pathFromRootToPageDir('http://www.foo.bar/x/y/z:200.html', {});
  t.is(
    path,
    'pages/www_foo_bar/x/y/z-200.html/',
    'should create path from url with sanitized characters'
  );
});

test(`Test pathFromRootToPageDir should create path from url with query string`, t => {
  const path = pathFromRootToPageDir('http://www.foo.bar/x/y/z?foo=bar', {});
  t.is(
    path,
    'pages/www_foo_bar/x/y/z/query-115ffe20/',
    'should create path from url with query string'
  );
});
