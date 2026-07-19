/**
 * A human name for an asset URL: the file name for ordinary assets, and
 * the first module name for MediaWiki ResourceLoader load.php batches,
 * where the path is identical for every request and the identity lives
 * in the modules query parameter (a middle-truncated load.php URL makes
 * every row in a table look the same).
 */
export function assetName(url) {
  try {
    const parsed = new URL(url);
    if (parsed.pathname.endsWith('/load.php')) {
      const packed = parsed.searchParams.get('modules');
      if (packed) {
        // ResourceLoader packs module lists as a.b,c|d.e where a comma
        // continues the prefix of the previous full name — counting
        // separators counts modules without expanding the prefixes, and
        // the first item is always a complete module name.
        const moduleCount = packed.split(/[,|]/).length;
        const first = packed.split(/[,|]/)[0];
        const only = parsed.searchParams.get('only');
        let batch = 'load.php batch';
        if (first === 'startup') {
          batch = 'load.php startup';
        } else if (only === 'styles') {
          batch = 'load.php styles batch';
        } else if (only === 'scripts') {
          batch = 'load.php scripts batch';
        }
        return { name: first, host: parsed.hostname, moduleCount, batch };
      }
    }
    const file = parsed.pathname.split('/').findLast(Boolean);
    return { name: file || parsed.hostname, host: parsed.hostname };
  } catch {
    return { name: url, host: '' };
  }
}
