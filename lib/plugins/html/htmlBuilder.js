'use strict';

const fs = require('fs'),
  helper = require('./helper'),
  Promise = require('bluebird'),
  path = require('path'),
  merge = require('lodash.merge'),
  reduce = require('lodash.reduce'),
  get = require('lodash.get'),
  set = require('lodash.set'),
  renderer = require('./renderer');

Promise.promisifyAll(fs);

const PAGES_DIRECTORY = 'pages';

class HTMLBuilder {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.summaryPages = {};
    this.urlPages = {};
    this.urlRunPages = {};
  }

  addUrl(url) {
    this.urlPages[url] = {
      path: 'pages/' + this.storageManager.relativePathFromUrl(url),
      data: {}
    };
    this.urlRunPages[url] = {};
  }

  addErrorForUrl(url, data) {
    const errors = get(this.urlPages[url], 'errors', []);
    errors.push(data);
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
      let values = get(this.urlPages[url].data, typePath);
      if (values && Array.isArray(values)) {
        values.push(data);
      } else {
        if (Array.isArray(data)) {
          set(this.urlPages[url].data, typePath, data);
        } else {
          set(this.urlPages[url].data, typePath, [data]);
        }
      }
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
    const errors = reduce(this.urlPages, (errors, urlInfo, url) => {
      if (urlInfo.errors) {
        errors[url] = urlInfo.errors;
      }
      return errors;
    }, {});

    if (Object.keys(errors).length > 0) {
      this.addDataForSummaryPage('errors', {errors});
    }

    this.addDataForSummaryPage('pages', {pages: this.urlPages});
    this.addDataForSummaryPage('index', {pageTitle: 'Summary', menu: 'summary'});

    const summaryRenders = Object.keys(this.summaryPages)
      .map((name) => this._renderSummaryPage(name, this.summaryPages[name]));

    const urlPageRenders = Promise.resolve(Object.keys(this.urlPages))
      .map((url) => {
        const pageInfo = this.urlPages[url];

        const runPages = this.urlRunPages[url];
        return this._renderUrlPage(url, 'index', {url, pageInfo, options, runPages})
          .tap(() => Promise.resolve(Object.keys(runPages))
            .map((runIndex) =>
              this._renderUrlRunPage(url, runIndex, {url, runIndex, pageInfo: runPages[runIndex], options})));
      });

    // Aggregate/summarize data and write additional files
    return Promise.all(summaryRenders)
      .then(() => Promise.all(urlPageRenders))
      .then(() => this.storageManager.copy(path.join(__dirname, 'assets')));
  }

  _renderUrlPage(url, name, locals) {
    // FIXME use path.relative to get link from page to index
    locals = merge({
      JSON: JSON,
      run: 0,
      path: '../../',
      menu: 'pages',
      pageTitle: name + ' ' + url,
      pageDescription: '',
      helper: helper
    }, locals);

    return this.storageManager.writeDataForUrl(url, PAGES_DIRECTORY, name + '.html', '',
      renderer.renderTemplate('url/' + name, locals));
  }

  _renderUrlRunPage(url, name, locals) {
    // FIXME use path.relative to get link from page to index
    locals = merge({
      urlLink: './index.html',
      JSON: JSON,
      path: '../../',
      menu: 'pages',
      pageTitle: name + ' ' + url,
      pageDescription: '',
      helper: helper
    }, locals);

    return this.storageManager.writeDataForUrl(url, PAGES_DIRECTORY, name + '.html', '',
      renderer.renderTemplate('url/run', locals));
  }

  _renderSummaryPage(name, locals) {
    // FIXME use path.relative to get link from page to index
    locals = merge({
      path: '',
      menu: name,
      pageTitle: name,
      pageDescription: '',
      helper: helper
    }, locals);

    return this.storageManager.writeData(name + '.html',
      renderer.renderTemplate(name, locals));
  }
}

module.exports = HTMLBuilder;
