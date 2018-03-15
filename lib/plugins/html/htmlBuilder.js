'use strict';

const helpers = require('../../support/helpers'),
  Promise = require('bluebird'),
  path = require('path'),
  merge = require('lodash.merge'),
  get = require('lodash.get'),
  log = require('intel').getLogger('sitespeedio.plugin.html'),
  chunk = require('lodash.chunk'),
  packageInfo = require('../../../package'),
  renderer = require('./renderer'),
  metricHelper = require('./metricHelper'),
  isEmpty = require('lodash.isempty');

const summaryBoxesSetup = require('./setup/summaryBoxes'),
  detailedSetup = require('./setup/detailed');

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

class HTMLBuilder {
  constructor(context, options) {
    this.storageManager = context.storageManager;
    this.timestamp = context.timestamp.format(TIME_FORMAT);
    this.options = options;
    this.summary = {};
    this.budget = context.budget;
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
      default:
        log.info('Got a undefined page type ' + type);
    }
  }

  addInlineCSS(css) {
    this.inlineCss.push(css);
  }

  render(dataCollector) {
    const options = this.options;
    const name = this.context.name;
    const timestamp = this.timestamp;
    const nTestedPages = dataCollector.getURLs().length;
    log.debug('Render HTML for %s page(s) ', nTestedPages);
    const errors = dataCollector.getErrorUrls();
    const css = this.inlineCSS.join('');
    if (Object.keys(errors).length > 0) {
      this.summary.errors = {
        errors,
        menu: 'errors'
      };
    }

    const validPages = dataCollector.getWorkingUrls();
    const summaryBoxes = summaryBoxesSetup(dataCollector.getSummary('index'));
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
      pageDescription: 'A list of the most used assets for the analyzed pages.'
    };

    this.summary.toplist = {
      pageTitle: `Largest assets by type for ${name} tested at ${timestamp}`,
      pageDescription: 'A list of the largest assets for the analyzed pages.'
    };

    if (options.budget) {
      let totalFailing = 0;
      let totalWorking = 0;
      for (const url of Object.keys(this.budget.failing)) {
        totalFailing = totalFailing + this.budget.failing[url].length;
      }
      for (const url of Object.keys(this.budget.working)) {
        totalWorking = totalWorking + this.budget.working[url].length;
      }
      this.summary.budget = {
        pageTitle: `Performance budget for ${name} with ${totalWorking} working and ${totalFailing} failing budgets.`,
        pageDescription: 'The list of failing and working performance budgets.',
        budget: this.budget,
        totalFailing,
        totalWorking
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

    const summaryRenders = Object.keys(this.summary).map(name =>
      this._renderSummaryPage(
        name,
        merge(
          {
            options,
            noPages: dataCollector.getURLs().length,
            css,
            h: helpers,
            rootPath: '',
            menu: name,
            pageTitle: name,
            pageDescription: '',
            headers: this.summary,
            version: packageInfo.version,
            timestamp: this.timestamp,
            context: this.context
          },
          dataCollector.getSummary(name),
          this.summary[name]
        )
      )
    );

    const urlPageRenders = Promise.resolve(Object.keys(validPages)).map(url => {
      const pageInfo = validPages[url];
      const runPages = dataCollector.getURLRuns(url);
      const medianRun = metricHelper.pickMedianRun(runPages, pageInfo);
      let summaryPageHAR = get(pageInfo, 'data.browsertime.har');
      // if we don't use Browsertime, we don't get the browser version
      const browser = summaryPageHAR
        ? {
            name: summaryPageHAR.log.browser.name,
            version: summaryPageHAR.log.browser.version
          }
        : { name: '', version: '' };
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

      let daurlAlias;
      if (
        options.urlsMetaData &&
        options.urlsMetaData[url] &&
        options.urlsMetaData[url].alias
      ) {
        daurlAlias = options.urlsMetaData[url].alias;
      }

      const summaryTimestamp = get(
        pageInfo,
        'data.browsertime.pageSummary.timestamp',
        this.timestamp
      );
      // Add pugs for extra plugins
      const pugs = {};
      const pageSummaries = this.pageSummaries.filter(
        summary => !!get(pageInfo.data, [summary.id, 'pageSummary'])
      );

      let data = {
        daurl: url,
        daurlAlias,
        pageInfo,
        options,
        runPages,
        summaryPageHAR,
        medianRun,
        browser,
        hasScreenShots: dataCollector.browsertimeScreenshots,
        screenShotType: dataCollector.browsertimeScreenshotsType,
        css,
        h: helpers,
        JSON: JSON,
        rootPath: this.storageManager.rootPathFromUrl(url),
        menu: 'pages',
        pageTitle: `Summary for ${helpers.plural(
          this.options.browsertime.iterations,
          'run'
        )} ${url} at ${summaryTimestamp}`,
        pageDescription: `${metricHelper.getMetricsFromPageSummary(
          pageInfo
        )} collected by sitespeed.io ${packageInfo.version}`,
        headers: this.summary,
        version: packageInfo.version,
        timestamp: summaryTimestamp,
        context: this.context,
        pageSummaries
      };

      for (const summary of pageSummaries) {
        pugs[summary.id] = renderer.renderTemplate(summary.id, data);
      }
      data.pugs = pugs;

      return this._renderUrlPage(url, 'index', data).tap(() =>
        Promise.resolve(Object.keys(runPages)).map(runIndex => {
          const pugs = {};
          const pageInfo = runPages[runIndex];
          const runTimestamp = get(
            pageInfo,
            'data.browsertime.run.timestamp',
            this.timestamp
          );

          const pageRuns = this.pageRuns.filter(
            run => !!get(pageInfo.data, [run.id, 'run'])
          );

          let data = {
            daurl: url,
            daurlAlias,
            runIndex,
            pageInfo,
            options,
            runPages,
            browser,
            hasScreenShots: dataCollector.browsertimeScreenshots,
            screenShotType: dataCollector.browsertimeScreenshotsType,
            css,
            h: helpers,
            urlLink: './index.html',
            JSON: JSON,
            rootPath: this.storageManager.rootPathFromUrl(url),
            menu: 'pages',
            pageTitle: `Run ${parseInt(runIndex) +
              1} for ${url} at ${runTimestamp}`,
            pageDescription: `${metricHelper.getMetricsFromRun(
              pageInfo
            )} collected by sitespeed.io ${packageInfo.version}`,
            headers: this.summary,
            version: packageInfo.version,
            timestamp: runTimestamp,
            context: this.context,
            pageRuns
          };
          // Add pugs for extra plugins
          for (const run of pageRuns) {
            pugs[run.id] = renderer.renderTemplate(run.id, data);
          }
          data.pugs = pugs;
          return this._renderUrlRunPage(url, runIndex, data);
        })
      );
    });
    // Aggregate/summarize data and write additional files
    return Promise.all(summaryRenders)
      .then(() => Promise.all(urlPageRenders))
      .then(() => {
        return this.storageManager.copyToResultDir(
          path.join(__dirname, 'assets')
        );
      })
      .then(() =>
        log.info('HTML stored in %s', this.storageManager.getBaseDir())
      );
  }

  _renderUrlPage(url, name, locals) {
    log.debug('Render URL page %s', name);

    return this.storageManager.writeHtmlForUrl(
      renderer.renderTemplate('url/' + name, locals),
      name + '.html',
      url
    );
  }

  _renderUrlRunPage(url, name, locals) {
    log.debug('Render URL run page %s', name);

    return this.storageManager.writeHtmlForUrl(
      renderer.renderTemplate('url/run', locals),
      name + '.html',
      url
    );
  }

  _renderSummaryPage(name, locals) {
    log.debug('Render summary page %s', name);

    return this.storageManager.writeHtml(
      renderer.renderTemplate(name, locals),
      name + '.html'
    );
  }
}

module.exports = HTMLBuilder;
