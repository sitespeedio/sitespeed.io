#!/usr/bin/env node
//
// Bundle waterfall-tools' core into a single-file IIFE that the report
// templates can pull in via a plain `<script>` tag. waterfall-tools'
// own published bundles target ES modules + chunked dynamic imports,
// which doesn't play nicely with the `file://` HTML reports we open
// straight from disk — a flat IIFE that exposes
// `globalThis.WaterfallTools` is the simplest contract.
//
// Run when bumping the waterfall-tools dependency:
//   npm run build:waterfall-tools
//
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const outFile = path.join(
  repoRoot,
  'lib/plugins/html/assets/js/waterfall-tools.min.js'
);

// waterfall-tools' published browser bundle still references a handful
// of node:* modules behind runtime platform checks. They never execute
// in the browser path, but esbuild has to be told not to resolve them.
const externals = [
  'node:fs',
  'node:fs/promises',
  'node:os',
  'node:path',
  'node:stream',
  'node:url',
  'node:zlib'
];

await build({
  stdin: {
    contents:
      `import { WaterfallTools } from 'waterfall-tools';\n` +
      `globalThis.WaterfallTools = WaterfallTools;\n`,
    resolveDir: repoRoot,
    sourcefile: 'waterfall-tools-entry.js'
  },
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  external: externals,
  outfile: outFile,
  legalComments: 'none'
});
console.log(
  'waterfall-tools bundle written to',
  path.relative(repoRoot, outFile)
);
