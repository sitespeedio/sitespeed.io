import test from 'ava';

import { assetName } from '../lib/support/helpers/assetName.js';

test('names an ordinary asset by its file name', t => {
  const named = assetName(
    'https://github.githubassets.com/assets/site-2d78c5de4a31d86e.css'
  );
  t.is(named.name, 'site-2d78c5de4a31d86e.css');
  t.is(named.host, 'github.githubassets.com');
  t.is(named.moduleCount, undefined);
});

test('names a ResourceLoader styles batch by its first module', t => {
  const named = assetName(
    'https://www.mediawiki.org/w/load.php?lang=en&modules=ext.discussionTools.init.styles%7Cext.pygments%2Ctranslate%7Cext.translate.tag.languages&only=styles&skin=vector-2022'
  );
  t.is(named.name, 'ext.discussionTools.init.styles');
  t.is(named.moduleCount, 4);
  t.is(named.batch, 'load.php styles batch');
});

test('names the ResourceLoader startup request', t => {
  const named = assetName(
    'https://www.mediawiki.org/w/load.php?lang=en&modules=startup&only=scripts&raw=1&skin=vector-2022'
  );
  t.is(named.name, 'startup');
  t.is(named.moduleCount, 1);
  t.is(named.batch, 'load.php startup');
});

test('names a single-module styles request', t => {
  const named = assetName(
    'https://www.mediawiki.org/w/load.php?lang=en&modules=site.styles&only=styles&skin=vector-2022'
  );
  t.is(named.name, 'site.styles');
  t.is(named.moduleCount, 1);
});

test('drops matrix parameters from an ad server file name', t => {
  const named = assetName(
    'https://ad.doubleclick.net/B34824155.441037688;dc_ver=106.314;sz=980x240;ord=32mspy'
  );
  t.is(named.name, 'B34824155.441037688');
  t.is(named.host, 'ad.doubleclick.net');
});

test('falls back to the hostname for a bare origin', t => {
  const named = assetName('https://www.example.com/');
  t.is(named.name, 'www.example.com');
});

test('survives an unparsable URL', t => {
  const named = assetName('not a url');
  t.is(named.name, 'not a url');
  t.is(named.host, '');
});
