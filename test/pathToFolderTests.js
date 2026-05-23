import test from 'ava';

import { pathToFolder } from '../lib/core/resultsStorage/pathToFolder.js';

test(`Test pathFromRootToPageDir should create path from site root`, t => {
  const path = pathToFolder('http://www.foo.bar', {});
  t.is(path, 'pages/www_foo_bar/', 'should create path from site root');
});

test(`Test pathFromRootToPageDir should create path from url`, t => {
  const path = pathToFolder('http://www.foo.bar/x/y/z.html', {});
  t.is(path, 'pages/www_foo_bar/x/y/z.html/', 'should create path from url');
});

test(`Test pathFromRootToPageDir should create path from url with sanitized characters`, t => {
  const path = pathToFolder('http://www.foo.bar/x/y/z:200.html', {});
  t.is(
    path,
    'pages/www_foo_bar/x/y/z-200.html/',
    'should create path from url with sanitized characters'
  );
});

test(`Test pathFromRootToPageDir should create path from url with query string`, t => {
  const path = pathToFolder('http://www.foo.bar/x/y/z?foo=bar', {});
  t.is(
    path,
    'pages/www_foo_bar/x/y/z/query-115ffe20/',
    'should create path from url with query string'
  );
});

// Issue #3880 — Chinese aliases must not all collapse to the same folder name.
test(`Chinese alias should be preserved in folder path (Issue #3880)`, t => {
  const path1 = pathToFolder('http://www.foo.bar', {}, '首页');
  const path2 = pathToFolder('http://www.foo.bar', {}, '关于我们');
  t.true(
    path1 !== path2,
    'distinct Chinese aliases must produce distinct folder paths'
  );
  // The aliases themselves must survive: each should contain the CJK chars.
  t.true(path1.includes('首页'), 'Chinese alias "首页" should appear in path');
  t.true(
    path2.includes('关于我们'),
    'Chinese alias "关于我们" should appear in path'
  );
});

test(`Mixed ASCII and Chinese alias should be preserved in folder path`, t => {
  const path = pathToFolder('http://www.foo.bar', {}, 'home-首页');
  t.true(
    path.includes('home-首页'),
    'mixed ASCII+CJK alias should be kept intact'
  );
});

test(`Cyrillic alias should be preserved in folder path`, t => {
  const path = pathToFolder('http://www.foo.bar', {}, 'главная');
  t.true(
    path.includes('главная'),
    'Cyrillic alias should appear in path unchanged'
  );
});
