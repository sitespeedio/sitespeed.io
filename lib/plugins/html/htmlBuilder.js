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
  packageInfo = require('../../../package'),
  renderer = require('./renderer');

Promise.promisifyAll(fs);

class HTMLBuilder {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.summaryPages = {};
    this.urlPages = {};
    this.urlRunPages = {};
  }

  addUrl(url) {
    this.urlPages[url] = {
      path: this.storageManager.relativePathFromUrl(url),
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
          path: this.storageManager.relativePathFromUrl(url),
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
      set(this.summaryPages, name, data);
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

    this.addDataForSummaryPage('pages', {pages: validPages});
    this.addDataForSummaryPage('index', {pageTitle: 'Summary'});

    const summaryRenders = Object.keys(this.summaryPages)
      .map((name) => this._renderSummaryPage(name, this.summaryPages[name]));

    const urlPageRenders = Promise.resolve(Object.keys(validPages))
      .map((url) => {
        const pageInfo = validPages[url];

        const runPages = this.urlRunPages[url];
        return this._renderUrlPage(url, 'index', {daurl: url, pageInfo, options, runPages})
          .tap(() => Promise.resolve(Object.keys(runPages))
            .map((runIndex) =>
              this._renderUrlRunPage(url, runIndex, {daurl: url, runIndex, pageInfo: runPages[runIndex], options})));
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
      pageTitle: name + ' ' + url,
      pageDescription: '',
      showWaterfallSummary: locals.options.html.showWaterfallSummary,
      headers: this.summaryPages,
      version: packageInfo.version,
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
      pageTitle: name + ' ' + url,
      pageDescription: '',
      headers: this.summaryPages,
      version: packageInfo.version,
      h: helpers
    }, locals);

    return this.storageManager.writeHtmlForUrl(url, name + '.html', renderer.renderTemplate('url/run', locals));
  }

  _renderSummaryPage(name, locals) {
    locals = merge({
      rootPath: '.',
      menu: name,
      pageTitle: name,
      pageDescription: '',
      headers: this.summaryPages,
      version: packageInfo.version,
      h: helpers
    }, locals);

    return this.storageManager.writeHtml(name + '.html', renderer.renderTemplate(name, locals));
  }
}

module.exports = HTMLBuilder;
