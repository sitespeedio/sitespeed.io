// Mark every testcase HTML file under _site/testcases/ with
// `data-pagefind-ignore` on its <body> tag so the next pagefind step
// skips them entirely. The testcases are hand-crafted HTML fixtures
// for measurement experiments — they contain song lyrics, garbage
// content and other bait that should never appear in docs search.
//
// Runs as part of `npm run build`, between Eleventy and Pagefind.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = '_site/testcases';

if (!existsSync(root)) {
  // No build output yet, nothing to do.
  process.exit(0);
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (extname(entry.name) === '.html') yield path;
  }
}

let marked = 0;
for await (const path of walk(root)) {
  const html = await readFile(path, 'utf8');
  if (html.includes('data-pagefind-ignore')) continue;
  const updated = html.replace(/<body(\s|>)/i, '<body data-pagefind-ignore$1');
  if (updated !== html) {
    await writeFile(path, updated);
    marked++;
  }
}
console.log(
  `[pagefind-prep] Marked ${marked} testcase HTML file(s) so pagefind skips them`
);
