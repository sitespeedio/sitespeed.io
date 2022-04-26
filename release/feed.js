const Feed = require('feed').Feed;
const fs = require('fs');
const path = require('path');
const parseChangelog = require('changelog-parser');
const { marked } = require('marked');

const allFeeds = [];

const images = {
  'sitespeed.io': 'https://www.sitespeed.io/img/logos/sitespeed.io.png',
  browsertime: 'https://www.sitespeed.io/img/logos/browsertime.png',
  'coach-core': 'https://www.sitespeed.io/img/logos/coach.png',
  pagexray: 'https://www.sitespeed.io/img/logos/pagexray.png',
  throttle: '',
  coach: 'https://www.sitespeed.io/img/logos/coach.png',
  'chrome-har': '',
  'chrome-trace': '',
  compare: 'https://www.sitespeed.io/img/logos/compare.png',
  humble: ''
};

const getSortedFiles = dir => {
  const files = fs.readdirSync(dir);

  return files
    .map(fileName => ({
      fileName: fileName,
      name: path.parse(fileName).name,
      time: fs.statSync(`${dir}/${fileName}`).mtime.getTime(),
      version: fs.readFileSync(`${dir}/${fileName}`, 'utf8').trim()
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

function getResultAsHTML(result) {
  let allData = '';
  if (result.parsed) {
    if (result.parsed.Added) {
      allData += `<h3>Added</h3>\n`;
      for (let added of result.parsed.Added) {
        allData += ' ' + marked.parse(added);
      }
    }
    if (result.parsed.Fixed) {
      allData += `<h3>Fixed</h3>\n`;
      for (let fixed of result.parsed.Fixed) {
        allData += ' ' + marked.parse(fixed);
      }
    }

    if (result.parsed.Changed) {
      allData += `<h3>Changed</h3>\n`;
      for (let changed of result.parsed.Changed) {
        allData += ' ' + marked.parse(changed);
      }
    }

    if (result.parsed['Breaking changes']) {
      allData += `<h3>Breaking changes</h3>\n`;
      for (let breaking of result.parsed['Breaking changes']) {
        allData += ' ' + marked.parse(breaking);
      }
    }

    if (result.parsed['Deprecated']) {
      allData += `<h3>Deprecated</h3>\n`;
      for (let deprecated of result.parsed['Deprecated']) {
        allData += ' ' + marked.parse(deprecated);
      }
    }

    if (result.parsed['Removed']) {
      allData += `<h3>Removed</h3>\n`;
      for (let removed of result.parsed['Removed']) {
        allData += ' ' + marked.parse(removed);
      }
    }

    if (result.parsed['Security']) {
      allData += `<h3>Security</h3>\n`;
      for (let security of result.parsed['Security']) {
        allData += ' ' + marked.parse(security);
      }
    }

    return allData;
  }
}

const getContent = async tool => {
  const content = [];
  const changelog =
    tool === 'sitespeed.io' ? './CHANGELOG.md' : '../' + tool + '/CHANGELOG.md';
  const result = await parseChangelog({
    filePath: changelog,
    removeMarkdown: false
  });

  for (let i = 0; i < 10; i++) {
    // It's not unreleased
    if (result.versions[i] && result.versions[i].date !== null) {
      content.push(result.versions[i]);
      allFeeds.push({ tool, item: result.versions[i] });
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

    const docPath = './docs/';

    fs.writeFileSync(
      path.join(docPath, 'feed', `${tool.name}.rss`),
      feed.rss2()
    );
    fs.writeFileSync(
      path.join(docPath, 'feed', `${tool.name}.atom`),
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

  const docPath = './docs/';

  fs.writeFileSync(path.join(docPath, 'feed', `rss.xml`), allFeed.rss2());
  fs.writeFileSync(path.join(docPath, 'feed', `atom.xml`), allFeed.atom1());
}

generateFeed();
