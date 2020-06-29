'use strict';

const defaultConfig = {};
const log = require('intel').getLogger('plugin.crux');
const merge = require('lodash.merge');
const throwIfMissing = require('../../support/util').throwIfMissing;
const cliUtil = require('../../cli/util');
const send = require('./send');
const path = require('path');
const pageSummary = require('./pageSummary');
const summary = require('./summary');
const fs = require('fs');

const DEFAULT_METRICS_PAGESUMMARY = [
  'loadingExperience.*.FIRST_CONTENTFUL_PAINT_MS.*',
  'loadingExperience.*.FIRST_INPUT_DELAY_MS.*',
  'loadingExperience.*.LARGEST_CONTENTFUL_PAINT_MS.*',
  'loadingExperience.*.CUMULATIVE_LAYOUT_SHIFT_SCORE.*'
];
const DEFAULT_METRICS_SUMMARY = [
  'originLoadingExperience.*.FIRST_CONTENTFUL_PAINT_MS.*',
  'originLoadingExperience.*.FIRST_INPUT_DELAY_MS.*',
  'originLoadingExperience.*.LARGEST_CONTENTFUL_PAINT_MS.*',
  'originLoadingExperience.*.CUMULATIVE_LAYOUT_SHIFT_SCORE.*'
];

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    this.make = context.messageMaker('crux').make;
    this.options = merge({}, defaultConfig, options.crux);
    this.testedOrigins = {};
    throwIfMissing(options.crux, ['key'], 'crux');
    this.formFactors = Array.isArray(this.options.formFactor)
      ? this.options.formFactor
      : [this.options.formFactor];
    this.pug = fs.readFileSync(
      path.resolve(__dirname, 'pug', 'index.pug'),
      'utf8'
    );
    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_PAGESUMMARY,
      'crux.pageSummary'
    );

    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_SUMMARY,
      'crux.summary'
    );
  },
  async processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'sitespeedio.setup': {
        queue.postMessage(make('crux.setup'));
        // Add the HTML pugs
        queue.postMessage(
          make('html.pug', {
            id: 'crux',
            name: 'CrUx',
            pug: this.pug,
            type: 'pageSummary'
          })
        );
        queue.postMessage(
          make('html.pug', {
            id: 'crux',
            name: 'CrUx',
            pug: this.pug,
            type: 'run'
          })
        );
        break;
      }
      case 'url': {
        let url = message.url;
        let group = message.group;
        const originResult = { originLoadingExperience: {} };
        if (!this.testedOrigins[group]) {
          log.info(`Get CrUx data for domain ${group}`);
          for (let formFactor of this.formFactors) {
            originResult.originLoadingExperience[formFactor] = await send.get(
              url,
              this.options.key,
              formFactor,
              false
            );
            if (originResult.originLoadingExperience[formFactor].error) {
              log.error(
                `${
                  originResult.originLoadingExperience[formFactor].message
                } for ${url} using ${formFactor}`
              );
            } else {
              originResult.originLoadingExperience[
                formFactor
              ] = pageSummary.repackage(
                originResult.originLoadingExperience[formFactor]
              );
            }
          }
          queue.postMessage(make('crux.summary', originResult, { group }));
          this.testedOrigins[group] = true;
        }

        log.info(`Get CrUx data for url ${url}`);
        const urlResult = { loadingExperience: {} };
        for (let formFactor of this.formFactors) {
          urlResult.loadingExperience[formFactor] = await send.get(
            url,
            this.options.key,
            formFactor,
            true
          );

          if (urlResult.loadingExperience[formFactor].error) {
            log.error(
              `${
                urlResult.loadingExperience[formFactor].message
              } for ${url} using ${formFactor}`
            );
          } else {
            urlResult.loadingExperience[formFactor] = summary.repackage(
              urlResult.loadingExperience[formFactor]
            );
          }
        }
        // Attach origin result so we can show it in the HTML
        urlResult.originLoadingExperience =
          originResult.originLoadingExperience;

        queue.postMessage(
          make('crux.pageSummary', urlResult, {
            url,
            group
          })
        );
      }
    }
  },
  get cliOptions() {
    return require(path.resolve(__dirname, 'cli.js'));
  },
  get config() {
    return cliUtil.pluginDefaults(this.cliOptions);
  }
};
