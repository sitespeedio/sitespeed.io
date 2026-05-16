// In-tree BFS HTML crawler. Built on node:fetch and a hand-rolled robots.txt
// parser; no external crawler dependency. The crawl is strictly serial and
// pinned to whatever origin the start URL lands on after redirects, which
// matches what the previous simplecrawler-based plugin did in practice.

const SKIPPED_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'pdf'
]);
const HTML_CONTENT_TYPE = /^(text|application)\/x?html\b/i;

const BASE_HREF_RE = /<base\b[^>]*?\bhref\s*=\s*["']?([^"'\s>]+)["']?/i;
const ANCHOR_HREF_RE = /<a\b[^>]*?\bhref\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

function unquote(value) {
  if (value.startsWith('"') || value.startsWith(`'`)) {
    return value.slice(1, -1);
  }
  return value;
}

function extractLinks(html, baseUrl) {
  const baseMatch = html.match(BASE_HREF_RE);
  let effectiveBase = baseUrl;
  if (baseMatch) {
    try {
      effectiveBase = new URL(baseMatch[1], baseUrl).href;
    } catch {
      // ignore malformed <base>
    }
  }

  const links = [];
  for (const m of html.matchAll(ANCHOR_HREF_RE)) {
    const raw = unquote(m[1]).trim();
    if (!raw) continue;
    if (
      raw.startsWith('#') ||
      raw.startsWith('javascript:') ||
      raw.startsWith('mailto:') ||
      raw.startsWith('tel:')
    ) {
      continue;
    }
    try {
      const resolved = new URL(raw, effectiveBase);
      resolved.hash = '';
      links.push(resolved.href);
    } catch {
      // ignore malformed href
    }
  }
  return links;
}

function getPathExtension(pathname) {
  const dot = pathname.lastIndexOf('.');
  if (dot === -1 || dot === pathname.length - 1) return '';
  return pathname.slice(dot + 1).toLowerCase();
}

// Parse robots.txt. Returns the list of Disallow path prefixes that apply to
// the given user agent. The first group whose User-agent is either `*` or a
// case-insensitive substring of the user agent header wins; later sections
// for the same user agent are ignored (matches the de-facto rules respected
// by most crawlers).
function parseRobotsTxt(text, userAgent) {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.replace(/#.*$/, '').trim())
    .filter(line => line.length > 0);

  const groups = [];
  let currentAgents = [];
  let lastDirective = '';
  for (const line of lines) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const directive = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (directive === 'user-agent') {
      if (lastDirective && lastDirective !== 'user-agent') {
        currentAgents = [];
      }
      currentAgents.push(value.toLowerCase());
      if (!groups.some(g => g.agents === currentAgents)) {
        groups.push({ agents: currentAgents, disallows: [] });
      }
    } else if (directive === 'disallow' && currentAgents.length > 0) {
      for (const group of groups) {
        if (group.agents === currentAgents) group.disallows.push(value);
      }
    }
    lastDirective = directive;
  }

  const lowerUa = (userAgent || '').toLowerCase();
  let specific;
  let wildcard;
  for (const group of groups) {
    for (const agent of group.agents) {
      if (agent === '*') {
        wildcard = group;
      } else if (lowerUa && lowerUa.includes(agent)) {
        specific = group;
      }
    }
  }
  return (specific || wildcard || { disallows: [] }).disallows;
}

function isAllowedByRobots(pathname, disallows) {
  for (const rule of disallows) {
    if (rule === '') continue;
    if (pathname.startsWith(rule)) return false;
  }
  return true;
}

async function fetchRobots(origin, userAgent) {
  try {
    const response = await fetch(new URL('/robots.txt', origin), {
      headers: userAgent ? { 'User-Agent': userAgent } : undefined
    });
    if (!response.ok) return [];
    const text = await response.text();
    return parseRobotsTxt(text, userAgent);
  } catch {
    return [];
  }
}

function buildHeaders({ userAgent, cookies, basicAuth }) {
  const headers = { Accept: 'text/html,application/xhtml+xml' };
  if (userAgent) headers['User-Agent'] = userAgent;
  if (cookies && cookies.length > 0) {
    headers.Cookie = cookies.join('; ');
  }
  if (basicAuth) {
    headers.Authorization = `Basic ${Buffer.from(basicAuth).toString(
      'base64'
    )}`;
  }
  return headers;
}

export async function crawl({
  startUrl,
  depth: maxDepth,
  maxPages,
  include,
  exclude,
  ignoreRobotsTxt,
  cookies,
  basicAuth,
  userAgent,
  onPage,
  log
}) {
  const headers = buildHeaders({ userAgent, cookies, basicAuth });
  const visited = new Set();
  const queue = [{ url: startUrl, depth: 1 }];

  let pageCount = 1;
  let crawlOrigin;
  let disallows = [];

  const passesFilters = url => {
    if (include) {
      for (const re of include) {
        if (!re.test(url)) {
          log.verbose(
            'Crawler skipping %s, matches need to include pattern %s',
            url,
            re
          );
          return false;
        }
      }
    }
    if (exclude) {
      for (const re of exclude) {
        if (re.test(url)) {
          log.verbose(
            'Crawler skipping %s, matches exclude pattern %s',
            url,
            re
          );
          return false;
        }
      }
    }
    return true;
  };

  log.info(
    'Starting to crawl from ' +
      startUrl +
      ' with max depth ' +
      maxDepth +
      ' and max count ' +
      maxPages
  );

  while (queue.length > 0) {
    const { url, depth } = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    const parsed = new URL(url);
    const extension = getPathExtension(parsed.pathname);
    if (SKIPPED_EXTENSIONS.has(extension)) continue;
    if (!passesFilters(url)) continue;

    if (crawlOrigin && parsed.origin !== crawlOrigin) {
      log.verbose('Crawler skipping cross-origin URL %s', url);
      continue;
    }
    if (
      crawlOrigin &&
      !ignoreRobotsTxt &&
      !isAllowedByRobots(parsed.pathname, disallows)
    ) {
      log.verbose('Crawler skipping %s, blocked by robots.txt', url);
      continue;
    }

    let response;
    try {
      response = await fetch(url, { headers, redirect: 'follow' });
    } catch (error) {
      log.warn('Crawler fetch error for %s: %s', url, error.message);
      continue;
    }

    const finalUrl = response.url || url;
    if (finalUrl !== url) {
      visited.add(finalUrl);
    }

    if (!crawlOrigin) {
      // First successful response decides the origin; matches
      // simplecrawler's allowInitialDomainChange behaviour, where we
      // follow the start URL through redirects and then pin the
      // crawl to whatever it landed on.
      crawlOrigin = new URL(finalUrl).origin;
      if (!ignoreRobotsTxt) {
        disallows = await fetchRobots(crawlOrigin, userAgent);
      }
    }

    const contentType = response.headers.get('content-type') || '';
    if (!HTML_CONTENT_TYPE.test(contentType)) {
      log.verbose('Crawler found non html URL %s', finalUrl);
      continue;
    }

    if (finalUrl === startUrl) {
      log.verbose('Crawler skipping initial URL %s', finalUrl);
    } else {
      log.verbose('Crawler found %s URL %s', pageCount, finalUrl);
      onPage(finalUrl);
      pageCount++;
      if (pageCount >= maxPages) {
        log.info('Crawler stopped after %d urls', pageCount);
        return;
      }
    }

    if (depth >= maxDepth) continue;

    const html = await response.text();
    const links = extractLinks(html, finalUrl);
    for (const link of links) {
      if (visited.has(link)) continue;
      let linkOrigin;
      try {
        linkOrigin = new URL(link).origin;
      } catch {
        continue;
      }
      if (linkOrigin !== crawlOrigin) continue;
      queue.push({ url: link, depth: depth + 1 });
    }
  }
}
