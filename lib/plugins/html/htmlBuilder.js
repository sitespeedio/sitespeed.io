'use strict';

const fs = require('fs'),
  helpers = require('./helpers'),
  Promise = require('bluebird'),
  path = require('path'),
  merge = require('lodash.merge'),
  reduce = require('lodash.reduce'),
  get = require('lodash.get'),
  set = require('lodash.set'),
  log = require('intel'),
  summaryBoxesSetup = require('./setup/summaryBoxes'),
  detailedSetup = require('./setup/detailed'),
  packageInfo = require('../../../package'),
  renderer = require('./renderer');

Promise.promisifyAll(fs);

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

class HTMLBuilder {
  constructor(context, options) {
    this.storageManager = context.storageManager;
    this.timestamp = context.timestamp;
    this.options = options;
    this.summaryPages = {};
    this.urlPages = {};
    this.urlRunPages = {};
  }

  addUrl(url) {
    this.urlPages[url] = {
      path: this.storageManager.pathFromRootToPageDir(url),
      data: {}
    };
    this.urlRunPages[url] = [];
  }

  addErrorForUrl(url, source, data) {
    const errors = get(this.urlPages[url], 'errors', {});
    errors[source] = data;
    set(this.urlPages[url], 'errors', errors);
  }

  addDataForUrl(url, typePath, data, runIndex) {
    if (runIndex !== undefined) {
      let runData = this.urlRunPages[url][runIndex] || {
          runIndex,
          data: {}
        };
      set(runData.data, typePath, data);
      this.urlRunPages[url][runIndex] = runData;
    } else {
      set(this.urlPages[url].data, typePath, data);
    }
  }

  addDataForSummaryPage(name, data) {
    if (this.summaryPages[name]) {
      merge(this.summaryPages[name], data);
    }
    else {
      set(this.summaryPages, name, merge({}, data));
    }
  }

  renderHTML(options) {
    log.info('Render HTML for %s page(s) ' , Object.keys(this.urlPages).length);
    const errors = reduce(this.urlPages, (errors, urlInfo, url) => {
      if (urlInfo.errors) {
        errors[url] = urlInfo.errors;
      }
      return errors;
    }, {});

    if (Object.keys(errors).length > 0) {
      this.addDataForSummaryPage('errors', {errors, menu: 'errors'});
    }

    const validPages = reduce(this.urlPages, (validPages, urlInfo, url) => {
      if (Object.keys(urlInfo.data).length > 0) {
        validPages[url] = urlInfo;
      }
      return validPages;
    }, {});

    this.addDataForSummaryPage('pages', {pageTitle: 'Overview of all tested pages',pageDescription: 'See all the tested pages on a high level.', pages: validPages});
    this.addDataForSummaryPage('index', {pageTitle: 'Summary of the sitespeed.io result', pageDescription: 'Executive summary of the sitespeed.io result. Act on red/yellow/green.', boxes: summaryBoxesSetup(this.summaryPages['index'])});
    this.addDataForSummaryPage('detailed', {pageTitle: 'In details summary of the sitespeed.io result.',pageDescription: 'Get all the details you need to fast track things you need to change.', metrics: detailedSetup(this.summaryPages['detailed'])});
    this.addDataForSummaryPage('domains', {pageTitle: 'The most used domains',pageDescription: 'A list of the most used domains and the respective timings'});
    this.addDataForSummaryPage('assets', {pageTitle: 'Most used assets',pageDescription: 'A list of the most used assets for the analyzed pages.'});

    // TODO check that the coach is avilible
    this.addDataForSummaryPage('help', {pageTitle: 'Definitions and help in for all the used metrics',pageDescription: '', coach: validPages[Object.keys(validPages)[0]]});

    const summaryRenders = Object.keys(this.summaryPages)
      .map((name) => this._renderSummaryPage(name, merge({options, noPages: Object.keys(this.urlPages).length},this.summaryPages[name])));

    const urlPageRenders = Promise.resolve(Object.keys(validPages))
      .map((url) => {
        const pageInfo = validPages[url];

        const runPages = this.urlRunPages[url];
        return this._renderUrlPage(url, 'index', {daurl: url, pageInfo, options, runPages})
          .tap(() => Promise.resolve(Object.keys(runPages))
            .map((runIndex) =>
              this._renderUrlRunPage(url, runIndex, {daurl: url, runIndex, pageInfo: runPages[runIndex], options, runPages})));
      });

    // Aggregate/summarize data and write additional files
    return Promise.all(summaryRenders)
      .then(() => Promise.all(urlPageRenders))
      .then(() => this.storageManager.copy(path.join(__dirname, 'assets')))
      .then(() => log.info('HTML stored in %s', this.storageManager.getBaseDir()))
      ;
  }

  _renderUrlPage(url, name, locals) {
    locals = merge({
      JSON: JSON,
      run: 0,
      rootPath: this.storageManager.rootPathFromUrl(url),
      menu: 'pages',
      pageTitle: 'Summary for all runs ' + url,
      pageDescription: '',
      showWaterfallSummary: locals.options.html.showWaterfallSummary,
      headers: this.summaryPages,
      version: packageInfo.version,
      timestamp: this.timestamp.format(TIME_FORMAT),
      h: helpers
    }, locals);

    return this.storageManager.writeHtmlForUrl(url, name + '.html', renderer.renderTemplate('url/' + name, locals));
  }

  _renderUrlRunPage(url, name, locals) {
    locals = merge({
      urlLink: './index.html',
      JSON: JSON,
      rootPath: this.storageManager.rootPathFromUrl(url),
      menu: 'pages',
      pageTitle: 'Run ' + name + ' when testing ' + url,
      pageDescription: '',
      headers: this.summaryPages,
      version: packageInfo.version,
      timestamp: this.timestamp.format(TIME_FORMAT),
      h: helpers
    }, locals);
    return this.storageManager.writeHtmlForUrl(url, name + '.html', renderer.renderTemplate('url/run', locals));
  }

  _renderSummaryPage(name, locals) {
    locals = merge({
      rootPath: '',
      menu: name,
      pageTitle: name,
      pageDescription: '',
      headers: this.summaryPages,
      version: packageInfo.version,
      timestamp: this.timestamp.format(TIME_FORMAT),
      h: helpers
    }, locals);

    return this.storageManager.writeHtml(name + '.html', renderer.renderTemplate(name, locals));
  }
}

module.exports = HTMLBuilder;
