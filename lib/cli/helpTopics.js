/*eslint no-console: 0*/

// Help-topic dispatch for the sitespeed.io CLI.
//
// sitespeed.io exposes ~600 options across 26 topical modules (chrome,
// firefox, graphite, s3, ...). The unfiltered --help dump is overwhelming.
// This module lets users say:
//
//   sitespeed.io --help              -> curated set of common options
//   sitespeed.io --help <topic>      -> only that topic + core options
//   sitespeed.io --help-all          -> the full historical dump
//
// The flag is stripped from argv before yargs sees it so yargs still
// treats it as a plain --help request; we run filtering via .hide() on
// the keys we want to suppress and rewrite the epilog accordingly.

// A curated set of "everyday" options the default --help should show.
// Keep this list short. Anything missing is one --help <topic> away.
const COMMON_KEYS = new Set([
  // core
  'mobile',
  'outputFolder',
  'verbose',
  'v',
  'open',
  'o',
  'view',
  // browser (registered as browsertime.*)
  'browsertime.browser',
  'browser',
  'browsertime.iterations',
  'n',
  'browsertime.preURL',
  'browsertime.docker',
  'browsertime.headless',
  // connectivity (commonly tuned)
  'browsertime.connectivity.engine',
  'browsertime.connectivity.profile',
  // video / vm
  'browsertime.video',
  'video',
  'browsertime.visualMetrics',
  'visualMetrics',
  'browsertime.cpu',
  'cpu',
  // config + help meta
  'config',
  'help',
  'h',
  'version',
  'V'
]);

const DOCS_URL = 'https://www.sitespeed.io/documentation/sitespeed.io/';

// Parse the raw arg list, detect help intent, and return a cleaned arg
// list with `--help-all` / `--help <topic>` collapsed to a plain
// `--help` so yargs can treat it normally.
//
// Returns { mode, topic, args } where mode is one of:
//   'none'    -> no --help passed
//   'default' -> plain --help, show the curated common subset
//   'topic'   -> --help <topic>, show only that topic + core
//   'all'     -> --help-all (or --help all), show everything (old behavior)
export function classifyHelp(rawArgs) {
  const cleaned = [];
  let mode = 'none';
  let topic;
  for (let i = 0; i < rawArgs.length; i++) {
    const a = rawArgs[i];
    if (a === '--help-all') {
      mode = 'all';
      cleaned.push('--help');
      continue;
    }
    if (a === '--help' || a === '-h' || a === '--help=true') {
      const next = rawArgs[i + 1];
      if (next && !next.startsWith('-')) {
        if (next === 'all') {
          mode = 'all';
          i++;
        } else {
          mode = 'topic';
          topic = next;
          i++;
        }
      } else if (mode === 'none') {
        mode = 'default';
      }
      cleaned.push('--help');
      continue;
    }
    cleaned.push(a);
  }
  return { mode, topic, args: cleaned };
}

// Register the topic groups against yargs and capture which keys each
// addOptions module contributes. We do this by snapshotting the registered
// keys before and after each addOptions call. No changes needed in the
// individual option modules.
export function registerTopics(yargsInstance, topicDefs) {
  const topicKeys = new Map();
  for (const [name, addFn] of topicDefs) {
    const before = new Set(Object.keys(yargsInstance.getOptions().key));
    addFn(yargsInstance);
    const after = Object.keys(yargsInstance.getOptions().key);
    topicKeys.set(
      name,
      after.filter(k => !before.has(k))
    );
  }
  return topicKeys;
}

// Build the epilog (footer) shown under --help, varying by mode.
export function buildEpilog(mode, topic, topicNames) {
  if (mode === 'all' || mode === 'none') {
    return `Read the docs at ${DOCS_URL}`;
  }
  if (mode === 'topic') {
    return [
      `Showing only the "${topic}" options.`,
      `Run with --help-all for the full reference, or --help to see common options.`,
      `Read the docs at ${DOCS_URL}`
    ].join('\n');
  }
  // default
  const topics = topicNames.filter(t => t !== 'core').join(', ');
  return [
    'Topics (use `sitespeed.io --help <topic>`):',
    '  ' + topics,
    '',
    'Run with --help-all to see every option, or read the docs at ' + DOCS_URL
  ].join('\n');
}

// Meta-flags that are always shown regardless of mode. These are the
// universal CLI handles (help/version/config/verbose) that every user
// expects to be reachable from any help screen.
const ALWAYS_KEEP = new Set([
  'help',
  'h',
  'version',
  'V',
  'config',
  'verbose',
  'v'
]);

// Apply the topic filter by calling yargs.hide() on every key not in
// the set we want to display. Returns true if filtering was applied.
export function applyHelpFilter(yargsInstance, mode, topic, topicKeys) {
  if (mode === 'none' || mode === 'all') return false;

  let keep;
  if (mode === 'topic') {
    if (!topicKeys.has(topic)) {
      console.error(`Unknown help topic: ${topic}`);
      console.error('Available topics: ' + [...topicKeys.keys()].join(', '));
      // CLI dispatch: bailing out here is intentional (deliberate "no
      // such topic" exit code), not an error to bubble up the stack.
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(2);
    }
    // Topic mode = just the topic. We deliberately do NOT fold in
    // COMMON_KEYS here -- that floor leaked things like --summary or
    // --mobile or --browsertime.iterations into every topic view, which
    // drowned the actual topic content. Users who want the common set
    // can run `sitespeed.io --help` separately.
    keep = new Set(topicKeys.get(topic));
  } else {
    // default
    keep = COMMON_KEYS;
  }

  const allKeys = Object.keys(yargsInstance.getOptions().key);
  for (const k of allKeys) {
    if (ALWAYS_KEEP.has(k)) continue;
    if (!keep.has(k)) {
      yargsInstance.hide(k);
    }
  }
  return true;
}
