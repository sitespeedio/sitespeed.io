import { Feed } from 'feed';
import {
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  existsSync
} from 'node:fs';
import path from 'node:path';
import parseChangelog from 'changelog-parser';
import { marked } from 'marked';

const allFeeds = [];

const images = {
  'sitespeed.io': 'https://www.sitespeed.io/img/logos/sitespeed.io.png',
  browsertime: 'https://www.sitespeed.io/img/logos/browsertime.png',
  'coach-core': 'https://www.sitespeed.io/img/logos/coach.png',
  pagexray: 'https://www.sitespeed.io/img/logos/pagexray.png',
  server: '',
  testrunner: '',
  throttle: '',
  coach: 'https://www.sitespeed.io/img/logos/coach.png',
  'chrome-har': '',
  'chrome-trace': '',
  compare: 'https://www.sitespeed.io/img/logos/compare.png',
  humble: ''
};

const getSortedFiles = dir => {
  const files = readdirSync(dir);

  return files
    .map(fileName => ({
      fileName: fileName,
      name: path.parse(fileName).name,
      time: statSync(`${dir}/${fileName}`).mtime.getTime(),
      version: readFileSync(`${dir}/${fileName}`, 'utf8').trim()
    }))
    .sort((a, b) => b.time - a.time);
};

function getFeed(tool, time) {
  return new Feed({
    title: `${tool} release feed`,
    description: `New releases and changelog feed of ${tool}`,
    id: `${tool}-release-feed`,
    link: 'https://www.sitespeed.io',
    language: 'en', // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    image: images[tool],
    favicon: 'http://www.sitespeed.io/favicon.ico',
    copyright: 'All rights reserved 2022, Peter Hedenskog and team',
    updated: new Date(time),
    feedLinks: {
      atom:
        tool === 'sitespeed.io'
          ? `https://www.sitespeed.io/feed/atom.xml`
          : `https://www.sitespeed.io/feed/${tool}.atom`,
      rss:
        tool === 'sitespeed.io'
          ? `https://www.sitespeed.io/feed/rss.xml`
          : `https://www.sitespeed.io/feed/${tool}.rss`
    },
    author: {
      name: 'Peter Hedenskog',
      email: 'peter@soulgalore.com',
      link: 'https://www.peterhedenskog.com'
    }
  });
}

function addItemToFeed(feed, item, tool) {
  feed.addItem({
    title: `${tool} ${item.version}`,
    id: `https://github.com/sitespeedio/${tool}/blob/main/CHANGELOG.md#${item.version}`,
    link: `https://github.com/sitespeedio/${tool}/blob/main/CHANGELOG.md#${item.version}`,
    description: getResultAsHTML(item),
    author: [
      {
        name: 'Sitespeed.io',
        link: 'https://www.sitespeed.io'
      }
    ],
    date: new Date(item.date),
    image: images[tool]
  });
}

// Grafana's news panel sanitizes the description: <h3>, <ul>, <li>, <a> are
// stripped/flattened, so block structure and links disappear. We render with
// <strong> + <br> (which survive sanitization) and inline the PR number as
// plain text instead of an <a> link.
function bulletAsHTML(md) {
  return marked
    .parse(md)
    .replaceAll(/<\/?(ul|li)>/g, '')
    .replaceAll(/<a [^>]*>([^<]+)<\/a>/g, '$1')
    .trim();
}

function getResultAsHTML(result) {
  if (!result.parsed) return '';

  const sections = [
    ['Added', result.parsed.Added],
    ['Fixed', result.parsed.Fixed],
    ['Changed', result.parsed.Changed],
    ['Breaking changes', result.parsed['Breaking changes']],
    ['Deprecated', result.parsed['Deprecated']],
    ['Removed', result.parsed['Removed']],
    ['Security', result.parsed['Security']]
  ];

  return sections
    .filter(([, items]) => items && items.length > 0)
    .map(
      ([title, items]) =>
        `<strong>${title}</strong><br>\n` +
        items.map(item => `- ${bulletAsHTML(item)}<br>\n`).join('')
    )
    .join('<br>\n');
}

// Where a tool's CHANGELOG.md lives, both on the maintainer's laptop (sibling
// repos checked out next to this one) and on GitHub (used as a fallback when
// the sibling isn't on disk, e.g. when this script runs from the release
// workflow runner). The npm package `coach-core` lives in the
// `sitespeedio/coach` repo, so the tool name and repo name diverge there.
const changelogLocations = tool => {
  if (tool === 'sitespeed.io') {
    return {
      local: './CHANGELOG.md',
      remote:
        'https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/CHANGELOG.md'
    };
  }
  if (tool === 'server' || tool === 'testrunner') {
    return {
      local: `../onlinetest/${tool}/CHANGELOG.md`,
      remote: `https://raw.githubusercontent.com/sitespeedio/onlinetest/main/${tool}/CHANGELOG.md`
    };
  }
  const repo = tool === 'coach-core' ? 'coach' : tool;
  return {
    local: `../${tool}/CHANGELOG.md`,
    remote: `https://raw.githubusercontent.com/sitespeedio/${repo}/main/CHANGELOG.md`
  };
};

const getContent = async tool => {
  const content = [];
  const { local, remote } = changelogLocations(tool);

  let result;
  if (existsSync(local)) {
    result = await parseChangelog({ filePath: local, removeMarkdown: false });
  } else {
    const response = await fetch(remote);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${remote}: ${response.status} ${response.statusText}`
      );
    }
    const text = await response.text();
    result = await parseChangelog({ text, removeMarkdown: false });
  }

  for (let index = 0; index < 10; index++) {
    // It's not unreleased
    if (result.versions[index] && result.versions[index].date !== null) {
      content.push(result.versions[index]);
      allFeeds.push({ tool, item: result.versions[index] });
    }
  }
  return content;
};
async function generateFeed() {
  const versionDir = './docs/_includes/version/';
  const sortedVersionFiles = getSortedFiles(versionDir);

  for (let tool of sortedVersionFiles) {
    const feed = getFeed(tool.name, tool.time);
    feed.addCategory('Web Performance');
    const items = await getContent(tool.name);
    for (let item of items) {
      addItemToFeed(feed, item, tool.name);
    }

    const documentPath = './docs/';

    writeFileSync(
      path.join(documentPath, 'feed', `${tool.name}.rss`),
      feed.rss2()
    );
    writeFileSync(
      path.join(documentPath, 'feed', `${tool.name}.atom`),
      feed.atom1()
    );
  }

  allFeeds.sort(function (a, b) {
    return new Date(b.item.date) - new Date(a.item.date);
  });

  const allFeed = getFeed('sitespeed.io', allFeeds[0].item.date);
  for (let item of allFeeds) {
    addItemToFeed(allFeed, item.item, item.tool);
  }

  const documentPath = './docs/';

  writeFileSync(path.join(documentPath, 'feed', `rss.xml`), allFeed.rss2());
  writeFileSync(path.join(documentPath, 'feed', `atom.xml`), allFeed.atom1());
}

await generateFeed();
