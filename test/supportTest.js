import test from 'ava';
import { keypathFromUrl } from '../lib/support/flattenMessage.js';

test('keypathFromUrl should generate keypath from basic URL without query and hash', t => {
  const url = 'https://example.com/path';
  const keypath = keypathFromUrl(url, false, false);
  // hostname: "example.com" -> toSafeKey: "example_com"
  // pathname: "/path" -> toSafeKey: "_path"
  // Combined: "example_com._path"
  t.is(keypath, 'example_com._path');
});

test('keypathFromUrl should generate keypath including query parameters when enabled', t => {
  const url = 'https://example.com/path?foo=bar';
  const keypath = keypathFromUrl(url, true, false);
  // Query: { foo: 'bar' } -> flattenQueryParameters produces "foo_bar"
  // Combined pathname and query: "_path_foo_bar"
  // Final keypath: "example_com._path_foo_bar"
  t.is(keypath, 'example_com._path_foo_bar');
});

test('keypathFromUrl should generate keypath including hash when enabled', t => {
  const url = 'https://example.com/path#section-two';
  const keypath = keypathFromUrl(url, false, true);
  // url.hash: "#section-two" remains unchanged by toSafeKey (since '#' is not replaced)
  // Combined: "_path_#section-two"
  // Final keypath: "example_com._path_#section-two"
  t.is(keypath, 'example_com._path_#section-two');
});

test('keypathFromUrl should override hostname with provided group parameter', t => {
  const url = 'https://example.com/path';
  const keypath = keypathFromUrl(url, false, false, 'customGroup');
  // Group parameter "customGroup" is used instead of url.hostname
  // Final keypath: "customGroup._path"
  t.is(keypath, 'customGroup._path');
});
