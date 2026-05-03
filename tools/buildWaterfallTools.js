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
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

// waterfall-tools doesn't expose ./package.json via its `exports` map,
// so resolve the package directly under node_modules instead of going
// through require.resolve.
const wtRoot = path.join(repoRoot, 'node_modules/waterfall-tools');
const wtCore = path.join(wtRoot, 'src/core/waterfall-tools.js');

// waterfall-tools resolves its canvas/storage backends via two named
// aliases at build time (see waterfall-tools/scripts/build.js); point
// both at the browser implementations so the bundle runs in the report.
const aliases = {
  'platform-canvas-impl': path.join(
    wtRoot,
    'src/platforms/browser/canvas-browser.js'
  ),
  'platform-storage-impl': path.join(
    wtRoot,
    'src/platforms/browser/storage-browser.js'
  )
};

// node:* imports inside waterfall-tools are guarded by runtime
// platform checks and never execute in the browser path; mark them
// external so esbuild stops trying to resolve them.
const externals = [
  'node:fs',
  'node:fs/promises',
  'node:os',
  'node:path',
  'node:stream',
  'node:url',
  'node:zlib'
];

const outFile = path.join(
  repoRoot,
  'lib/plugins/html/assets/js/waterfall-tools.min.js'
);

const tmp = mkdtempSync(path.join(tmpdir(), 'wt-bundle-'));
const entry = path.join(tmp, 'entry.js');
writeFileSync(
  entry,
  `import { WaterfallTools } from ${JSON.stringify(wtCore)};\n` +
    `globalThis.WaterfallTools = WaterfallTools;\n`
);

try {
  await build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    format: 'iife',
    platform: 'browser',
    alias: aliases,
    external: externals,
    outfile: outFile,
    legalComments: 'none'
  });
  console.log(
    'waterfall-tools bundle written to',
    path.relative(repoRoot, outFile)
  );
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
