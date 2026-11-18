export function addOptions(yargs) {
  yargs
    .option('crawler.depth', {
      alias: 'd',
      describe:
        'How deep to crawl (1=only one page, 2=include links from first page, etc.)',
      group: 'Crawler'
    })
    .option('crawler.maxPages', {
      alias: 'm',
      describe: 'The max number of pages to test. Default is no limit.',
      group: 'Crawler'
    })
    .option('crawler.exclude', {
      describe: String.raw`Exclude URLs matching the provided regular expression (ex: "/some/path/", "://some\.domain/"). Can be provided multiple times.`,
      group: 'Crawler'
    })
    .option('crawler.include', {
      describe: String.raw`Discard URLs not matching the provided regular expression (ex: "/some/path/", "://some\.domain/"). Can be provided multiple times.`,
      group: 'Crawler'
    })
    .option('crawler.ignoreRobotsTxt', {
      type: 'boolean',
      default: false,
      describe: 'Ignore robots.txt rules of the crawled domain.',
      group: 'Crawler'
    })
    .coerce('crawler', crawler => {
      if (crawler) {
        if (crawler.exclude) {
          if (!Array.isArray(crawler.exclude)) {
            crawler.exclude = [crawler.exclude];
          }
          crawler.exclude = crawler.exclude.map(e => new RegExp(e));
        }

        if (crawler.include) {
          if (!Array.isArray(crawler.include)) {
            crawler.include = [crawler.include];
          }
          crawler.include = crawler.include.map(e => new RegExp(e));
        }

        return crawler;
      }
    });
}
