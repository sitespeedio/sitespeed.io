import path from 'node:path';
import { platform, hostname } from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import dayjs from 'dayjs';
import { getLogger } from '@sitespeed.io/log';
import { markdown } from 'markdown';
import merge from 'lodash.merge';
import get from 'lodash.get';

const log = getLogger('sitespeedio.plugin.html');
const require = createRequire(import.meta.url);
const { dependencies, version } = require('../../../package.json');
import { renderTemplate } from './renderer.js';
import {
  pickMedianRun,
  getMetricsFromPageSummary,
  getMetricsFromRun
} from './metricHelper.js';

import * as helpers from '../../support/helpers/index.js';
import * as _html from './defaultConfig.js';
import summaryBoxesSetup from './setup/summaryBoxes.js';
import detailedSetup from './setup/detailed.js';
import { getFilmstrip } from '../browsertime/filmstrip.js';
import getScripts from './getScripts.js';
import friendlyNames from '../../support/friendlynames.js';
import { toArray, isEmpty } from '../../support/util.js';
import { getOS, osName } from '../../support/osUtil.js';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

export class HTMLBuilder {
  constructor(context, options) {
    this.storageManager = context.storageManager;
    this.timestamp = context.timestamp.format(TIME_FORMAT);
    this.options = options;
    this.summary = {};
    this.context = context;
    this.pageRuns = [];
    this.pageSummaries = [];
    this.summaries = [];
    this.inlineCSS = [];
  }

  addType(id, name, type) {
    switch (type) {
      case 'run': {
        this.pageRuns.push({ id, name });
        break;
      }
      case 'pageSummary': {
        this.pageSummaries.push({ id, name });
        break;
      }
      case 'summary': {
        this.summaries.push({ id, name });
        break;
      }
      default: {
        log.info('Got a undefined page type ' + type);
      }
    }
  }

  addInlineCSS(css) {
    this.inlineCSS.push(css);
  }

  async render(dataCollector) {
    const options = this.options;
    const name = this.context.name;
    const timestamp = this.timestamp;
    const nTestedPages = dataCollector.getURLs().length;
    log.debug('Render HTML for %s page(s) ', nTestedPages);
    const errors = dataCollector.getErrorUrls();
    // If we have any errors that are not linked to a URL, add them
    if (Object.keys(dataCollector.getErrors()).length > 0) {
      errors['generic'] = dataCollector.getErrors();
    }
    const css = this.inlineCSS.join('');
    const assetsBaseURL = this.options.html.assetsBaseURL;
    if (Object.keys(errors).length > 0) {
      this.summary.errors = {
        errors,
        menu: 'errors'
      };
    }

    const validPages = dataCollector.getWorkingUrls();
    const summaryBoxes = summaryBoxesSetup(
      dataCollector.getSummary('index'),
      options.html
    );
    const detailedBoxes = detailedSetup(dataCollector.getSummary('detailed'));

    this.summary.pages = {
      pageTitle: `Overview of ${helpers.plural(
        nTestedPages,
        'page'
      )} for ${name} at ${timestamp}`,
      pageDescription: 'See all the tested pages on a high level.',
      pages: validPages
    };

    this.summary.index = {
      pageTitle: `Executive Summary for ${name} tested ${helpers.plural(
        nTestedPages,
        'page'
      )} at ${timestamp}`,
      pageDescription:
        'Executive summary of the sitespeed.io result. Act on red/yellow/green.',
      boxes: chunk(summaryBoxes.filter(Boolean), 3)
    };

    this.summary.detailed = {
      pageTitle: `In details summary for ${name} tested ${helpers.plural(
        nTestedPages,
        'page'
      )} at ${timestamp}`,
      pageDescription:
        'Get all the details you need to fast track things you need to change.',
      metrics: detailedBoxes
    };

    this.summary.domains = {
      pageTitle: `The most used domains for ${name} tested at ${timestamp}`,
      pageDescription:
        'A list of the most used domains and the respective timings'
    };

    this.summary.assets = {
      pageTitle: `Most used assets for ${name} tested at ${timestamp}`,
      pageDescription: 'A list of the most used assets for the analysed pages.'
    };

    this.summary.toplist = {
      pageTitle: `Largest assets by type for ${name} tested at ${timestamp}`,
      pageDescription: 'A list of the largest assets for the analysed pages.'
    };

    this.summary.settings = {
      pageTitle: `Runtime settings ${timestamp}`,
      pageDescription: 'Runtime settings for your run.'
    };

    if (options.multi && options.html.showScript) {
      const scripts = await getScripts(options);
      this.summary.scripts = {
        pageTitle: `Scripts used to run the analyse`,
        pageDescription: '',
        scripts
      };
    }

    if (options.budget) {
      const budget = dataCollector.getBudget();
      let totalFailing = 0;
      let totalWorking = 0;
      for (const url of Object.keys(budget.failing)) {
        totalFailing = totalFailing + budget.failing[url].length;
      }
      for (const url of Object.keys(budget.working)) {
        totalWorking = totalWorking + budget.working[url].length;
      }
      const aliasToUrl = {};
      for (let url of Object.keys(options.urlsMetaData)) {
        aliasToUrl[options.urlsMetaData[url].urlAlias] = url;
      }
      this.summary.budget = {
        pageTitle: `Performance budget for ${name} with ${totalWorking} working and ${totalFailing} failing budgets.`,
        pageDescription: 'The list of failing and working performance budgets.',
        budget,
        totalFailing,
        totalWorking,
        aliasToUrl
      };
    }

    // TODO check that the coach is available
    const aPage = validPages[Object.keys(validPages)[0]];
    const coachData = get(aPage, 'data.coach.pageSummary.advice');
    this.summary.help = {
      pageTitle: 'Definitions and help in for all the metrics',
      pageDescription: '',
      coach: coachData
    };

    let browser;
    let android;
    let ios;
    let connectivity;
    let usingBrowsertime;
    let cpuBenchmark;
    let windowSize;
    const urlPageRenders = [];
    let pageNumber = 0;
    const testedPages = Object.keys(validPages).length;
    for (let url of Object.keys(validPages)) {
      const pageInfo = validPages[url];
      const runPages = dataCollector.getURLRuns(url);
      const medianRun = pickMedianRun(runPages, pageInfo);
      // If we have multiple URLs in the same HAR the median run must be converted
      // to the right run in the HAR
      const harIndex = pageNumber + (medianRun.runIndex - 1) * testedPages;
      let summaryPageHAR = get(pageInfo, 'data.browsertime.har');
      pageNumber++;
      // In the future we can fix so we just pickup the setup messages
      usingBrowsertime = pageInfo.data.browsertime;
      // if we don't use Browsertime, we don't get the browser version

      browser = usingBrowsertime
        ? {
            name: pageInfo.data.browsertime.pageSummary.info.browser.name,
            version: pageInfo.data.browsertime.pageSummary.info.browser.version,
            userAgent:
              pageInfo.data.browsertime.pageSummary.info.browser.userAgent,
            args: pageInfo.data.browsertime.pageSummary.info.browser.args,
            traceCategories:
              pageInfo.data.browsertime.pageSummary.info.browser
                .traceCategories,
            preference:
              pageInfo.data.browsertime.pageSummary.info.browser.preference,
            geckoProfilerFeatures:
              pageInfo.data.browsertime.pageSummary.info.browser
                .geckProfilerFeatures
          }
        : {
            name: '',
            version: ''
          };
      cpuBenchmark = get(
        pageInfo,
        'data.browsertime.pageSummary.browserScripts[0].browser.cpuBenchmark'
      );
      windowSize = get(
        pageInfo,
        'data.browsertime.pageSummary.browserScripts[0].browser.windowSize'
      );
      android = get(pageInfo, 'data.browsertime.pageSummary.info.android');
      ios = get(pageInfo, 'data.browsertime.pageSummary.info.ios');
      connectivity = get(
        pageInfo,
        'data.browsertime.pageSummary.info.connectivity'
      );

      // if we are on the summary page we inline the HAR and then make sure
      // we only pick one HAR run (medianRun). But you can also choose to
      // fetch the HAR in the HTML, then it isn't included.
      if (!(isEmpty(runPages) || options.html.showAllWaterfallSummary)) {
        // only if we have some browsertime metrics, take the HAR and pass it to the summary
        const har = get(runPages[medianRun], 'data.browsertime.run.har');
        if (har) {
          summaryPageHAR = har;
        }
      }

      // First get the alias from Browsertime
      let daurlAlias = get(pageInfo, 'data.browsertime.pageSummary.info.alias');
      if (
        options.urlsMetaData &&
        options.urlsMetaData[url] &&
        options.urlsMetaData[url].urlAlias
      ) {
        daurlAlias = options.urlsMetaData[url].urlAlias;
      }

      // Take the timestamp from the first run from Browsertime. If you
      // don't use browsertime fallback,
      const summaryTimestamp = pageInfo.data.browsertime
        ? dayjs(pageInfo.data.browsertime.pageSummary.timestamps[0]).format(
            TIME_FORMAT
          )
        : timestamp;

      // Add pugs for extra plugins
      const pugs = {};
      const pageSummaries = this.pageSummaries.filter(
        summary => !!get(pageInfo.data, [summary.id, 'pageSummary'])
      );
      // We use this for the filmstrip and in the  future we should use the data there
      // as median run all over in the HTML
      const medianPageInfo = runPages[medianRun.runIndex - 1];
      let filmstripData =
        medianPageInfo && medianPageInfo.data && medianPageInfo.data.browsertime
          ? await getFilmstrip(
              medianPageInfo.data.browsertime.run,
              medianRun.runIndex,
              this.storageManager.getFullPathToURLDir(url, daurlAlias),
              options
            )
          : [];
      let rootPath = this.storageManager.rootPathFromUrl(url, daurlAlias);
      let data = {
        daurl: url,
        daurlAlias,
        pageInfo,
        options,
        runPages,
        harIndex,
        summaryPageHAR,
        medianRun,
        browser,
        connectivity,
        android,
        ios,
        hasScreenShots: dataCollector.browsertimeScreenshots,
        screenShotType: dataCollector.browsertimeScreenshotsType,
        css,
        filmstrip: filmstripData,
        h: helpers,
        JSON,
        get,
        markdown: markdown,
        rootPath,
        resultUrls: this.context.resultUrls,
        assetsPath: assetsBaseURL || rootPath,
        sitespeedioURL: options.html.homeurl,
        menu: 'pages',
        pageTitle: `Summary for ${helpers.plural(
          this.options.browsertime.iterations,
          'run'
        )} ${url} at ${summaryTimestamp}`,
        pageDescription: `${getMetricsFromPageSummary(
          pageInfo
        )} collected by sitespeed.io ${version}`,
        headers: this.summary,
        version: version,
        timestamp: summaryTimestamp,
        context: this.context,
        pageSummaries
      };

      for (const summary of pageSummaries) {
        pugs[summary.id] = renderTemplate(summary.id, data);
      }
      data.pugs = pugs;

      const mySummary = pageInfo;

      await this._renderUrlPage(url, 'index', data, daurlAlias);
      for (let runIndex of Object.keys(runPages)) {
        const iteration = Number(runIndex) + 1;
        const pugs = {};
        const pageInfo = runPages[runIndex];
        const runTimestamp = get(
          pageInfo,
          'data.browsertime.run.timestamp',
          this.timestamp
        );

        const filmstripData = pageInfo.data.browsertime
          ? await getFilmstrip(
              pageInfo.data.browsertime.run,
              iteration,
              this.storageManager.getFullPathToURLDir(url, daurlAlias),
              options
            )
          : [];
        const pageRuns = this.pageRuns.filter(
          run => !!get(pageInfo.data, [run.id, 'run'])
        );
        let rootPath = this.storageManager.rootPathFromUrl(url, daurlAlias);
        let data = {
          daurl: url,
          daurlAlias,
          iteration,
          runIndex,
          harIndex: options.multi
            ? pageNumber + Number(runIndex) * testedPages - 1
            : runIndex, // TODO add docs
          pageInfo,
          options,
          runPages,
          browser,
          connectivity,
          android,
          ios,
          hasScreenShots: dataCollector.browsertimeScreenshots,
          screenShotType: dataCollector.browsertimeScreenshotsType,
          css,
          h: helpers,
          urlLink: './index.html',
          filmstrip: filmstripData,
          JSON: JSON,
          get,
          markdown: markdown,
          rootPath,
          resultUrls: this.context.resultUrls,
          assetsPath: assetsBaseURL || rootPath,
          sitespeedioURL: options.html.homeurl,
          menu: 'pages',
          pageTitle: `Run ${
            Number.parseInt(runIndex) + 1
          } for ${url} at ${runTimestamp}`,
          pageDescription: `${getMetricsFromRun(
            pageInfo
          )} collected by sitespeed.io ${version}`,
          headers: this.summary,
          version: version,
          timestamp: runTimestamp,
          friendlyNames,
          context: this.context,
          pageRuns
        };
        // Add pugs for extra plugins
        for (const run of pageRuns) {
          pugs[run.id] = renderTemplate(run.id, data);
        }

        data.pugs = pugs;
        urlPageRenders.push(
          this._renderUrlRunPage(
            url,
            Number.parseInt(runIndex) + 1,
            data,
            daurlAlias
          )
        );

        // Do only once per URL
        if (Number.parseInt(runIndex) === 0) {
          data.mySummary = mySummary;
          urlPageRenders.push(
            this._renderMetricSummaryPage(url, 'metrics', data, daurlAlias)
          );
        }
      }
    }

    // Kind of clumsy way to decide if the user changed HTML summaries,
    // so we in the pug can automatically add visual metrics
    const hasPageSummaryMetricInput =
      options.html.pageSummaryMetrics !== _html.pageSummaryMetrics;

    let osInfo = osName();
    if (platform() === 'linux') {
      const linux = await getOS();
      osInfo = `${linux.dist} ${linux.release}`;
    }

    // do this late so we can pickup data (browser/android etc)
    const summaryRenders = Object.keys(this.summary).map(name =>
      this._renderSummaryPage(
        name,
        merge(
          {
            options,
            noPages:
              dataCollector.getURLs().length +
              dataCollector.getRemovedURLs().length,
            removedUrls: dataCollector.getRemovedURLs(),
            css,
            h: helpers,
            rootPath: '',
            assetsPath: assetsBaseURL || '',
            sitespeedioURL: options.html.homeurl,
            menu: name,
            pageTitle: name,
            pageDescription: '',
            browser,
            hostname: hostname(),
            cpuBenchmark,
            windowSize,
            os: osInfo,
            connectivity,
            android,
            ios,
            usingBrowsertime,
            usingWebPageTest: false,
            headers: this.summary,
            version: version,
            browsertimeVersion: dependencies.browsertime,
            timestamp: this.timestamp,
            context: this.context,
            get,
            friendlyNames,
            hasPageSummaryMetricInput,
            html: {
              pageSummaryMetrics: toArray(options.html.pageSummaryMetrics)
            }
          },
          dataCollector.getSummary(name),
          this.summary[name]
        )
      )
    );

    let res;
    res = this.options.html.assetsBaseURL
      ? Promise.resolve()
      : this.storageManager.copyToResultDir(path.join(__dirname, 'assets'));

    return res.then(() =>
      Promise.allSettled(summaryRenders)
        .then(() => Promise.allSettled(urlPageRenders))
        .then(() =>
          log.info('HTML stored in %s', this.storageManager.getBaseDir())
        )
    );
  }

  async _renderUrlPage(url, name, locals, alias) {
    log.debug('Render URL page %s', name);
    return this.storageManager.writeHtmlForUrl(
      renderTemplate('url/summary/' + name, locals),
      name + '.html',
      url,
      alias
    );
  }

  async _renderUrlRunPage(url, name, locals, alias) {
    log.debug('Render URL run page %s', name);
    return this.storageManager.writeHtmlForUrl(
      renderTemplate('url/iteration/index', locals),
      name + '.html',
      url,
      alias
    );
  }

  async _renderMetricSummaryPage(url, name, locals, alias) {
    log.debug('Render URL metric page %s', name);
    return this.storageManager.writeHtmlForUrl(
      renderTemplate('url/summary/metrics/index', locals),
      name + '.html',
      url,
      alias
    );
  }

  async _renderSummaryPage(name, locals) {
    log.debug('Render summary page %s', name);

    return this.storageManager.writeHtml(
      renderTemplate(name, locals),
      name + '.html'
    );
  }
}
