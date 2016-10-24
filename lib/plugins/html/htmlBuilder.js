'use strict';

const fs = require('fs'),
  helpers = require('../../support/helpers'),
  Promise = require('bluebird'),
  path = require('path'),
  merge = require('lodash.merge'),
  get = require('lodash.get'),
  log = require('intel'),
  packageInfo = require('../../../package'),
  renderer = require('./renderer');

Promise.promisifyAll(fs);

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

class HTMLBuilder {
  constructor(context, options) {
    this.storageManager = context.storageManager;
    this.timestamp = context.timestamp.format(TIME_FORMAT);
    this.options = options;
    this.dataCollection = context.dataCollection;
    this.summary = {};
    this.budget = context.budget;
  }

  render() {
    const options = this.options;
    const dataCollection = this.dataCollection;

    log.info('Render HTML for %s page(s) ', Object.keys(dataCollection.urlPages).length);
    const errors = dataCollection.getErrorPages();

    if (Object.keys(errors).length > 0) {
      this.summary.errors = {
        errors,
        menu: 'errors'
      };
    }

    const validPages = dataCollection.getValidPages();
    this.summary.pages = {
      pageTitle: 'Overview of all tested pages',
      pageDescription: 'See all the tested pages on a high level.',
      pages: validPages
    };

    this.summary.index = {
      pageTitle: 'Summary of the sitespeed.io result',
      pageDescription: 'Executive summary of the sitespeed.io result. Act on red/yellow/green.',
      boxes: dataCollection.getSummaryBoxes()
    };

    this.summary.detailed = {
      pageTitle: 'In details summary of the sitespeed.io result.',
      pageDescription: 'Get all the details you need to fast track things you need to change.',
      metrics: dataCollection.getDetailedBoxes()
    };

    this.summary.domains = {
      pageTitle: 'The most used domains',
      pageDescription: 'A list of the most used domains and the respective timings'
    };

    this.summary.assets = {
      pageTitle: 'Most used assets',
      pageDescription: 'A list of the most used assets for the analyzed pages.'
    };

    this.summary.toplist = {
      pageTitle: 'Largest assets by type ',
      pageDescription: 'A list of the largest assets for the analyzed pages.'
    };

    if (options.budget) {
      let totalFailing = 0;
      let totalWorking = 0;
      for (const url of Object.keys(this.budget.failing )) {
        totalFailing = totalFailing + this.budget.failing[url].length;
      }
      for (const url of Object.keys(this.budget.working )) {
        totalWorking = totalWorking + this.budget.working[url].length;
      }
      this.summary.budget = {
        pageTitle: 'Performance budget ',
        pageDescription: 'The list of failing and working perfomance budgets.',
        budget: this.budget,
        totalFailing,
        totalWorking
      };
    }

    // TODO check that the coach is available
    const aPage = validPages[Object.keys(validPages)[0]];
    const coachData = get(aPage, 'data.coach.pageSummary.advice');
    this.summary.help = {
      pageTitle: 'Definitions and help in for all the used metrics',
      pageDescription: '',
      coach: coachData
    };


    const summaryRenders = Object.keys(this.summary)
      .map((name) => this._renderSummaryPage(name, merge({
        options,
        noPages: Object.keys(dataCollection.urlPages).length
      }, dataCollection.summaryPages[name], this.summary[name])));

    const urlPageRenders = Promise.resolve(Object.keys(validPages))
      .map((url) => {
        const pageInfo = validPages[url];

        const runPages = dataCollection.urlRunPages[url];

        // only if we have some browsertime metrics, take the HAR and pass it to the summary
        let summaryPageHAR;
        if (runPages[0].data.browsertime || pageInfo.data.browsertime) {
          summaryPageHAR = options.html.showAllWaterfallSummary ? pageInfo.data.browsertime.har : runPages[0].data.browsertime.run.har;
        }

        return this._renderUrlPage(url, 'index', {
            daurl: url,
            pageInfo,
            options,
            runPages,
            summaryPageHAR
          })
          .tap(() => Promise.resolve(Object.keys(runPages))
            .map((runIndex) =>
              this._renderUrlRunPage(url, runIndex, {
                daurl: url,
                runIndex,
                pageInfo: runPages[runIndex],
                options,
                runPages
              })));
      });

    // Aggregate/summarize data and write additional files
    return Promise.all(summaryRenders)
      .then(() => Promise.all(urlPageRenders))
      .then(() => this.storageManager.copy(path.join(__dirname, 'assets')))
      .then(() => log.info('HTML stored in %s', this.storageManager.getBaseDir()));
  }

  _renderUrlPage(url, name, locals) {
    locals = merge({
      JSON: JSON,
      run: 0,
      rootPath: this.storageManager.rootPathFromUrl(url),
      menu: 'pages',
      pageTitle: 'Summary for all runs ' + url,
      pageDescription: '',
      headers: this.summary,
      version: packageInfo.version,
      timestamp: this.timestamp,
      h: helpers
    }, locals);

    return this.storageManager.writeHtmlForUrl(renderer.renderTemplate('url/' + name, locals), name + '.html', url);
  }

  _renderUrlRunPage(url, name, locals) {
    locals = merge({
      urlLink: './index.html',
      JSON: JSON,
      rootPath: this.storageManager.rootPathFromUrl(url),
      menu: 'pages',
      pageTitle: 'Run ' + (parseInt(name) + 1) + ' when testing ' + url,
      pageDescription: '',
      headers: this.summary,
      version: packageInfo.version,
      timestamp: this.timestamp,
      h: helpers
    }, locals);

    return this.storageManager.writeHtmlForUrl(renderer.renderTemplate('url/run', locals), name + '.html', url);
  }

  _renderSummaryPage(name, locals) {
    locals = merge({
      rootPath: '',
      menu: name,
      pageTitle: name,
      pageDescription: '',
      headers: this.summary,
      version: packageInfo.version,
      timestamp: this.timestamp,
      h: helpers
    }, locals);

    return this.storageManager.writeHtml(name + '.html', renderer.renderTemplate(name, locals));
  }
}

module.exports = HTMLBuilder;
