// Turn a raw camelCase data key into a readable label
// ("domContentLoadedTime" -> "DOM content loaded time") for the
// places where the HTML report would otherwise show the key verbatim.
// Well-known acronyms keep their casing so the result reads as the
// term developers know, not "Dom" or "Cls".
const ACRONYMS = new Set([
  'js',
  'css',
  'dom',
  'url',
  'html',
  'http',
  'https',
  'cdp',
  'v8',
  'lcp',
  'fcp',
  'cls',
  'tbt',
  'ttfb',
  'fid',
  'inp',
  'cpu',
  'gpu',
  'tls',
  'ssl',
  'dns',
  'cdn',
  'har'
]);

export function metricName(key) {
  if (!key) {
    return key;
  }
  const words = String(key)
    .replaceAll(/([a-z\d])([A-Z])/g, '$1 $2')
    .replaceAll(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replaceAll(/([a-z])(\d)/g, '$1 $2')
    .split(/[\s_]+/);
  return words
    .map((word, index) => {
      if (ACRONYMS.has(word.toLowerCase())) {
        return word.toUpperCase();
      }
      return index === 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase();
    })
    .join(' ');
}
