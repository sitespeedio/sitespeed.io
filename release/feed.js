const Feed = require('feed').Feed;
const fs = require('fs');
const path = require('path');
const parseChangelog = require('changelog-parser');

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

function getResult(result) {
  let allData = '';
  if (result.parsed) {
    if (result.parsed.Added) {
      for (let added of result.parsed.Added) {
        allData += ' ' + added;
      }
    }
    if (result.parsed.Fixed) {
      for (let fixed of result.parsed.Fixed) {
        allData += ' ' + fixed;
      }
    }
    return allData;
  }
}

async function generateFeed() {
  const versionDir = './docs/_includes/version/';
  const sortedVersionFiles = getSortedFiles(versionDir);

  const feed = new Feed({
    title: 'sitespeed.io release feed',
    description: 'Follow new releases of sitespeed.io tools',
    id: 'https://www.sitespeed.io',
    link: 'https://www.sitespeed.io',
    language: 'en', // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    image: 'https://www.sitespeed.io/img/logos/sitespeed.io.png',
    favicon: 'http://www.sitespeed.io/favicon.ico',
    copyright: 'All rights reserved 2021, Peter Hedenskog and team',
    updated: new Date(sortedVersionFiles[0].time), // use the date from the latest updated version file
    feedLinks: {
      atom: 'https://www.sitespeed.io/feed/atom.xml',
      rss: 'https://www.sitespeed.io/feed/rss.xml'
    },
    author: {
      name: 'Peter Hedenskog',
      email: 'peter@soulgalore.com',
      link: 'https://www.peterhedenskog.com'
    }
  });

  const getContent = async () => {
    const content = {};
    for (let tool of sortedVersionFiles) {
      const changelog =
        tool.name === 'sitespeed.io'
          ? './CHANGELOG.md'
          : '../' + tool.name + '/CHANGELOG.md';
      const result = await parseChangelog(changelog);
      if (result.versions[0].date !== null) {
        content[tool.name] = getResult(result.versions[0]);
      } else if (result.versions[1]) {
        content[tool.name] = getResult(result.versions[1]);
      } else {
        // skip missing data
        console.log(`Missing data for tool ${tool.name}`);
      }
    }
    return content;
  };

  const descriptions = await getContent();
  const images = {
    'sitespeed.io': 'https://www.sitespeed.io/img/logos/sitespeed.io.png',
    browsertime: 'https://www.sitespeed.io/img/logos/browsertime.png',
    'coach-core': 'https://www.sitespeed.io/img/logos/coach.png',
    pagexray: 'https://www.sitespeed.io/img/logos/pagexray.png',
    throttle: '',
    coach: 'https://www.sitespeed.io/img/logos/coach.png',
    'chrome-har': '',
    'chrome-trace': '',
    compare: 'https://www.sitespeed.io/img/logos/compare.png'
  };

  sortedVersionFiles.forEach(file => {
    feed.addItem({
      title: `${file.name} ${file.version}`,
      id: `https://github.com/sitespeedio/${file.name}/blob/main/CHANGELOG.md#${
        file.version
      }`,
      link: `https://github.com/sitespeedio/${
        file.name
      }/blob/main/CHANGELOG.md#`,
      description: descriptions[file.name],
      // content: content[file.name],
      author: [
        {
          name: 'Sitespeed.io',
          link: 'https://www.sitespeed.io'
        }
      ],
      date: new Date(file.time),
      image: images[file.name]
    });
  });

  feed.addCategory('Performance');

  const docPath = './docs/';

  fs.writeFileSync(path.join(docPath, 'feed', 'rss.xml'), feed.rss2());
  fs.writeFileSync(path.join(docPath, 'feed', 'atom.xml'), feed.atom1());
}

generateFeed();
