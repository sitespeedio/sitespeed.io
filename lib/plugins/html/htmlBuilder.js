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

const cssName = 'gridly.min.css';

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

  renderHTML(options) {
    const errors = reduce(this.urlPages, (errors, urlInfo, url) => {
      if (urlInfo.errors) {
        errors[url] = urlInfo.errors;
      }
      return errors;
    }, {});

    let renderErrorPage;

    if (Object.keys(errors).length > 0) {
      renderErrorPage = this.renderSummaryPage('errors', {errors});
    } else {
      renderErrorPage = Promise.resolve();
    }

    const urlPageRenders = Promise.resolve(Object.keys(this.urlPages))
      .map((url) => {
        const pageInfo = this.urlPages[url];

        const urlRunPages = this.urlRunPages[url];
        const runIndices = Object.keys(urlRunPages);

        return this._renderUrlPage(url, 'index', {url, pageInfo, options, runPages: this.urlRunPages[url]})
          .tap(() => Promise.resolve(runIndices).map((runIndex) =>
            this._renderUrlRunPage(url, runIndex, {url, runIndex, pageInfo: urlRunPages[runIndex], options})));
      });

    // Aggregate/summarize data and write additional files
    return renderErrorPage
      .then(() => Promise.all([
        this.renderSummaryPage('pages', {pages: this.urlPages}),
        this.renderSummaryPage('index', {summaryPages: this.summaryPages})]))
      .then(() => {
          // TODO might replace with fs-extra#copy
          let cssPath = path.join(__dirname, '..', '..', '..', 'node_modules', 'gridly', 'dist', cssName);
          return this._copySiteAsset(cssPath);
        }
      )
      .then(() => Promise.all(urlPageRenders));
  }

  _copySiteAsset(fromPath) {
    return this.storageManager.writeData(path.basename(fromPath),
      fs.readFileAsync(fromPath, 'utf8'));
  }

  _renderUrlPage(url, name, locals) {
    // FIXME use path.relative to get link from page to index
    locals = merge(locals, {
      indexLink: '../index.html',
      cssLink: '../' + cssName,
      JSON: JSON,
      helper: helper,
      run: 0
    });

    return this.storageManager.writeDataForUrl(url, name + '.html',
      renderer.renderTemplate('url/' + name, locals));
  }

  _renderUrlRunPage(url, name, locals) {
    // FIXME use path.relative to get link from page to index
    locals = merge(locals, {
      indexLink: '../index.html',
      urlLink: './index.html',
      cssLink: '../' + cssName,
      JSON: JSON,
      helper: helper
    });

    return this.storageManager.writeDataForUrl(url, name + '.html',
      renderer.renderTemplate('url/run', locals));
  }

  renderSummaryPage(name, locals) {
    if (name !== 'index') {
      this.summaryPages[name] = name + '.html';
    }

    // FIXME use path.relative to get link from page to index
    locals = merge(locals, {
      indexLink: './index.html',
      cssLink: cssName,
      helper: helper
    });

    return this.storageManager.writeData(name + '.html',
      renderer.renderTemplate(name, locals));
  }
}

module.exports = HTMLBuilder;
