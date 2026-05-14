import test from 'ava';
import yargs from 'yargs';

import {
  classifyHelp,
  registerTopics,
  applyHelpFilter,
  buildEpilog
} from '../lib/cli/helpTopics.js';

test('classifyHelp recognises a plain --help', t => {
  const result = classifyHelp(['--help']);
  t.is(result.mode, 'default');
  t.deepEqual(result.args, ['--help']);
});

test('classifyHelp recognises --help <topic> and strips the topic', t => {
  const result = classifyHelp(['--help', 'chrome']);
  t.is(result.mode, 'topic');
  t.is(result.topic, 'chrome');
  t.deepEqual(result.args, ['--help']);
});

test('classifyHelp recognises --help-all', t => {
  const result = classifyHelp(['--help-all']);
  t.is(result.mode, 'all');
  t.deepEqual(result.args, ['--help']);
});

test('classifyHelp recognises --help all (space form)', t => {
  const result = classifyHelp(['--help', 'all']);
  t.is(result.mode, 'all');
  t.deepEqual(result.args, ['--help']);
});

test('classifyHelp returns none when --help is not present', t => {
  const result = classifyHelp(['https://example.com', '-n', '5']);
  t.is(result.mode, 'none');
  t.is(result.topic, undefined);
  t.deepEqual(result.args, ['https://example.com', '-n', '5']);
});

test('classifyHelp does not eat the next arg when it looks like a flag', t => {
  const result = classifyHelp(['--help', '--mobile']);
  t.is(result.mode, 'default');
  t.deepEqual(result.args, ['--help', '--mobile']);
});

test('registerTopics groups keys by the addOptions function that introduced them', t => {
  const y = yargs([]);
  const topics = registerTopics(y, [
    ['alpha', yy => yy.option('alpha.one', { describe: 'a1' })],
    [
      'beta',
      yy =>
        yy
          .option('beta.one', { describe: 'b1' })
          .option('beta.two', { describe: 'b2' })
    ]
  ]);
  t.deepEqual(topics.get('alpha'), ['alpha.one']);
  t.deepEqual(topics.get('beta'), ['beta.one', 'beta.two']);
});

test('applyHelpFilter hides everything outside the requested topic', t => {
  const y = yargs([]);
  const topics = registerTopics(y, [
    [
      'core',
      yy =>
        yy
          .option('mobile', { type: 'boolean' })
          .option('debugMessages', { type: 'boolean' })
          .option('config', { type: 'string' })
    ],
    ['chrome', yy => yy.option('chrome.args', { type: 'string' })],
    ['s3', yy => yy.option('s3.bucketname', { type: 'string' })]
  ]);

  applyHelpFilter(y, 'topic', 'chrome', topics);

  const opts = y.getOptions();
  // The topic's own keys are kept.
  t.false(opts.hiddenOptions.includes('chrome.args'));
  // Other topics are hidden.
  t.true(opts.hiddenOptions.includes('s3.bucketname'));
  // Core keys are hidden in topic mode -- topic views should focus on
  // the topic, not re-render common stuff that's one --help away.
  t.true(opts.hiddenOptions.includes('mobile'));
  t.true(opts.hiddenOptions.includes('debugMessages'));
  // Universal meta-flags stay visible.
  t.false(opts.hiddenOptions.includes('config'));
});

test('buildEpilog mentions the topic list in default mode', t => {
  const epilog = buildEpilog('default', undefined, ['core', 'chrome', 's3']);
  t.true(epilog.includes('chrome'));
  t.true(epilog.includes('s3'));
  // core should not appear in the user-facing topic list.
  t.false(/\bcore\b/.test(epilog));
});

test('buildEpilog mentions the active topic in topic mode', t => {
  const epilog = buildEpilog('topic', 'chrome', ['core', 'chrome']);
  t.true(epilog.includes('chrome'));
  t.true(epilog.includes('--help-all'));
});
