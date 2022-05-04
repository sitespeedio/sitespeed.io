'use strict';

const defaultConfig = {};
const log = require('intel').getLogger('plugin.crux');
const merge = require('lodash.merge');
const throwIfMissing = require('../../support/util').throwIfMissing;
const cliUtil = require('../../cli/util');
const send = require('./send');
const path = require('path');
const repackage = require('./repackage');
const fs = require('fs');

const DEFAULT_METRICS_PAGESUMMARY = [
  'loadingExperience.*.FIRST_CONTENTFUL_PAINT_MS.*',
  'loadingExperience.*.FIRST_INPUT_DELAY_MS.*',
  'loadingExperience.*.LARGEST_CONTENTFUL_PAINT_MS.*',
  'loadingExperience.*.CUMULATIVE_LAYOUT_SHIFT_SCORE.*',
  'loadingExperience.*.TIME_TO_FIRST_BYTE_MS.*',
  'loadingExperience.*.INTERACTION_TO_NEXT_PAINT_MS.*'
];
const DEFAULT_METRICS_SUMMARY = [
  'originLoadingExperience.*.FIRST_CONTENTFUL_PAINT_MS.*',
  'originLoadingExperience.*.FIRST_INPUT_DELAY_MS.*',
  'originLoadingExperience.*.LARGEST_CONTENTFUL_PAINT_MS.*',
  'originLoadingExperience.*.CUMULATIVE_LAYOUT_SHIFT_SCORE.*',
  'originLoadingExperience.*.TIME_TO_FIRST_BYTE_MS.*',
  'originLoadingExperience.*.INTERACTION_TO_NEXT_PAINT_MS.*'
];

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const CRUX_WAIT_TIME = 300;

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    this.make = context.messageMaker('crux').make;
    this.options = merge({}, defaultConfig, options.crux);
    if (this.options.enable === true) {
      this.testedOrigins = {};
      throwIfMissing(options.crux, ['key'], 'crux');
      this.formFactors = Array.isArray(this.options.formFactor)
        ? this.options.formFactor
        : [this.options.formFactor];
      this.pug = fs.readFileSync(
        path.resolve(__dirname, 'pug', 'index.pug'),
        'utf8'
      );

      if (this.options.collect === 'ALL' || this.options.collect === 'URL') {
        context.filterRegistry.registerFilterForType(
          DEFAULT_METRICS_PAGESUMMARY,
          'crux.pageSummary'
        );
      }

      context.filterRegistry.registerFilterForType(
        DEFAULT_METRICS_SUMMARY,
        'crux.summary'
      );
    }
  },
  async processMessage(message, queue) {
    if (this.options.enable === true) {
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
          if (
            !this.testedOrigins[group] &&
            (this.options.collect === 'ALL' ||
              this.options.collect === 'ORIGIN')
          ) {
            this.testedOrigins[group] = true;
            log.info(`Get CrUx data for domain ${group}`);
            for (let formFactor of this.formFactors) {
              originResult.originLoadingExperience[formFactor] = await send.get(
                url,
                this.options.key,
                formFactor,
                false
              );

              if (originResult.originLoadingExperience[formFactor].error) {
                log.info(
                  `${originResult.originLoadingExperience[formFactor].error.message} for domain ${url} using ${formFactor}`
                );

                queue.postMessage(
                  make(
                    'error',
                    `${originResult.originLoadingExperience[formFactor].error.message} for domain ${url} using ${formFactor}`,
                    {
                      url
                    }
                  )
                );
              } else {
                try {
                  originResult.originLoadingExperience[formFactor] = repackage(
                    originResult.originLoadingExperience[formFactor]
                  );
                } catch (e) {
                  log.error(
                    'Could not repackage the JSON for origin from CrUx, is it broken? %j',
                    originResult.originLoadingExperience[formFactor]
                  );
                }
              }
              await wait(CRUX_WAIT_TIME);
            }
            queue.postMessage(make('crux.summary', originResult, { group }));
          }

          if (
            this.options.collect === 'ALL' ||
            this.options.collect === 'URL'
          ) {
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
                log.info(
                  `${urlResult.loadingExperience[formFactor].error.message} for ${url} using ${formFactor}`
                );

                queue.postMessage(
                  make(
                    'error',
                    `${urlResult.loadingExperience[formFactor].error.message} for ${url} using ${formFactor}`,
                    {
                      url
                    }
                  )
                );
              } else {
                try {
                  urlResult.loadingExperience[formFactor] = repackage(
                    urlResult.loadingExperience[formFactor]
                  );
                } catch (e) {
                  log.error(
                    'Could not repackage the JSON from CrUx, is it broken? %j',
                    urlResult.loadingExperience[formFactor]
                  );
                }
              }
              await wait(CRUX_WAIT_TIME);
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
          } else {
            queue.postMessage(
              make(
                'crux.pageSummary',
                {
                  originLoadingExperience: originResult.originLoadingExperience
                },
                {
                  url,
                  group
                }
              )
            );
          }
        }
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
