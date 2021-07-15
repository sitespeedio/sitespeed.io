const Feed = require('feed').Feed;
const fs = require('fs');
const path = require('path');

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

const descriptions = {
  'sitespeed.io':
    'Sitespeed.io is the complete toolbox to test the web performance of your web site. Use it to monitor your performance or checkout how your competition is doing.',
  browsertime:
    'Browsertime is the heart of sitespeed.io that handles everything with the browser. At the moment we support Chrome, Firefox, Edge and Safari on desktop, Chrome on Android and limited support for Safari on iOS',
  'coach-core':
    'The coach helps you find performance problems on your web page.',
  pagexray:
    'We love HAR files but it’s hard to actually see how the page is composed only looking at the file. PageXray converts a HAR file to a JSON format that is easier to read and easier to use.',
  throttle:
    'Throttle lets you simulate slow network connections on Linux and Mac OS X.',
  coach: 'The coach helps you find performance problems on your web page.',
  'chrome-har': 'Create HAR files based on Chrome Debugging Protocol data.',
  'chrome-trace': '',
  compare: 'Make it easier to find regressions by comparing your HAR files.'
};
const content = {};
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
    link: `https://github.com/sitespeedio/${file.name}/blob/main/CHANGELOG.md#`,
    description: descriptions[file.name],
    content: content[file.name],
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
