import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import intel from 'intel';
import merge from 'lodash.merge';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

import { throwIfMissing } from '../../support/util.js';

import { repackage } from './repackage.js';
import { send } from './send.js';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const log = intel.getLogger('plugin.crux');

const defaultConfig = {};

const DEFAULT_METRICS_PAGESUMMARY = [
  'loadingExperience.*.FIRST_CONTENTFUL_PAINT_MS.*',
  'loadingExperience.*.LARGEST_CONTENTFUL_PAINT_MS.*',
  'loadingExperience.*.CUMULATIVE_LAYOUT_SHIFT_SCORE.*',
  'loadingExperience.*.TIME_TO_FIRST_BYTE_MS.*',
  'loadingExperience.*.INTERACTION_TO_NEXT_PAINT_MS.*',
  'loadingExperience.*.ROUND_TRIP_TIME_MS.*',
  'loadingExperience.*.NAVIGATION_TYPES_FRACTIONS.*',
  'loadingExperience.*.FORM_FACTORS_FRACTIONS.*'
];
const DEFAULT_METRICS_SUMMARY = [
  'originLoadingExperience.*.FIRST_CONTENTFUL_PAINT_MS.*',
  'originLoadingExperience.*.LARGEST_CONTENTFUL_PAINT_MS.*',
  'originLoadingExperience.*.CUMULATIVE_LAYOUT_SHIFT_SCORE.*',
  'originLoadingExperience.*.TIME_TO_FIRST_BYTE_MS.*',
  'originLoadingExperience.*.INTERACTION_TO_NEXT_PAINT_MS.*',
  'originLoadingExperience.*.ROUND_TRIP_TIME_MS.*',
  'originLoadingExperience.*.NAVIGATION_TYPES_FRACTIONS.*',
  'originLoadingExperience.*.FORM_FACTORS_FRACTIONS.*'
];

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const CRUX_WAIT_TIME = 300;

export default class CruxPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'crux', options, context, queue });
  }

  open(context, options) {
    this.make = context.messageMaker('crux').make;
    this.options = merge({}, defaultConfig, options.crux);
    if (this.options.enable === true) {
      this.testedOrigins = {};
      throwIfMissing(options.crux, ['key'], 'crux');
      this.formFactors = Array.isArray(this.options.formFactor)
        ? this.options.formFactor
        : [this.options.formFactor];
      this.pug = readFileSync(
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
  }
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
              originResult.originLoadingExperience[formFactor] = await send(
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
                } catch {
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
              urlResult.loadingExperience[formFactor] = await send(
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
                } catch {
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
  }
}
