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
      renderErrorPage = this.renderSummaryPage('errors', {
        errors
      });
    } else {
      renderErrorPage = Promise.resolve();
    }

    const urlPageRenders = Promise.resolve(Object.keys(this.urlPages))
      .map((url) => {
        const pageInfo = this.urlPages[url];

        const urlRunPages = this.urlRunPages[url];
        const runIndices = Object.keys(urlRunPages);

        return this._renderUrlPage(url, 'index', {
            url,
            pageInfo,
            options,
            runPages: this.urlRunPages[url]
          })
          .tap(() => Promise.resolve(runIndices).map((runIndex) =>
            this._renderUrlRunPage(url, runIndex, {
              url,
              runIndex,
              pageInfo: urlRunPages[runIndex],
              options
            })));
      });

    // Aggregate/summarize data and write additional files
    return renderErrorPage
      .then(() => Promise.all([
        this.renderSummaryPage('pages', {
          pages: this.urlPages,
          menu: 'pages',
          pageTitle: '',
          pageDescription: ''
        }),
        this.renderSummaryPage('index', {
          summaryPages: this.summaryPages,
          menu: 'summary',
          pageTitle: '',
          pageDescription: ''
        })
      ]))
      .then(() => {
        return this.storageManager.copy(path.join(__dirname, 'assets'));
      })
      .then(() => Promise.all(urlPageRenders));
  }

  _renderUrlPage(url, name, locals) {
    // FIXME use path.relative to get link from page to index
    locals = merge(locals, {
      JSON: JSON,
      path: '../',
      helper: helper,
      pageTitle: '',
      pageDescription: '',
      run: 0
    });

    return this.storageManager.writeDataForUrl(url, name + '.html',
      renderer.renderTemplate('url/' + name, locals));
  }

  _renderUrlRunPage(url, name, locals) {
    // FIXME use path.relative to get link from page to index
    locals = merge(locals, {
      urlLink: './index.html',
      path: '../',
      JSON: JSON,
      helper: helper,
      pageTitle: '',
      pageDescription: ''
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
      path: '',
      helper: helper
    });

    return this.storageManager.writeData(name + '.html',
      renderer.renderTemplate(name, locals));
  }
}

module.exports = HTMLBuilder;
