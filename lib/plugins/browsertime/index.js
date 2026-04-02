// eslint-disable-next-line unicorn/no-named-default
import { default as _merge } from 'lodash.merge';

import { getLogger } from '@sitespeed.io/log';
import { configureLogging } from 'browsertime';

const log = getLogger('plugin.browsertime');

import get from 'lodash.get';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

import { BrowsertimeAggregator } from './browsertimeAggregator.js';
import { metricsPageSummary as DEFAULT_METRICS_PAGE_SUMMARY } from './default/metricsPageSummary.js';
import { metricsSummary as DEFAULT_METRICS_SUMMARY } from './default/metricsSummary.js';
import { metricsRun as DEFAULT_METRICS_RUN } from './default/metricsRun.js';
import { metricsRunLimited as DEFAULT_METRICS_RUN_LIMITED } from './default/metricsRunLimited.js';
import { AxeAggregator } from './axeAggregator.js';
import { browsertimeDefaultSettings as defaultConfig } from './default/config.js';
import { processUrl } from './processUrl.js';

export default class BrowsertimePlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'browsertime', options, context, queue });
  }

  concurrency = 1;

  open(context, options) {
    //   this.make = context.messageMaker('browsertime').make;
    this.useAxe = options.axe && options.axe.enable;
    this.options = _merge({}, defaultConfig, options.browsertime);
    this.allOptions = options;
    _merge(this.options, { verbose: options.verbose, axe: options.axe });
    this.firstParty = options.firstParty;
    this.options.mobile = options.mobile;
    this.storageManager = context.storageManager;
    this.resultUrls = context.resultUrls;
    this.postChromeTrace = options.postChromeTrace;
    this.pluginScripts = [];
    this.pluginAsyncScripts = [];
    this.screenshotType = get(
      options,
      'browsertime.screenshotParams.type',
      defaultConfig.screenshotParams.type
    );

    this.scriptOrMultiple = options.multi;
    this.allAlias = {};
    this.browsertimeAggregator = new BrowsertimeAggregator();

    // hack for disabling viewport on Android that's not supported
    if (
      this.options.chrome &&
      this.options.chrome.android &&
      this.options.chrome.android.package
    ) {
      this.options.viewPort = undefined;
    }

    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_PAGE_SUMMARY,
      'browsertime.pageSummary'
    );
    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_SUMMARY,
      'browsertime.summary'
    );
    context.filterRegistry.registerFilterForType(
      this.options.limitedRunData
        ? DEFAULT_METRICS_RUN_LIMITED
        : DEFAULT_METRICS_RUN,
      'browsertime.run'
    );
    this.axeAggregatorTotal = new AxeAggregator(this.options);
    configureLogging(options);
  }

  async processMessage(message) {
    const options = this.options;
    switch (message.type) {
      // When sitespeed.io starts, a setup messages is posted on the queue
      // and all plugins can tell other plugins that they are alive and are ready
      // to receive configuration
      case 'sitespeedio.setup': {
        // Let other plugins know that the browsertime plugin is alive
        super.sendMessage('browsertime.setup');
        // Unfify alias setup
        if (this.options.urlMetaData) {
          for (let url of Object.keys(this.options.urlMetaData)) {
            const alias = this.options.urlMetaData[url];
            try {
              const group = new URL(url).hostname;
              this.allAlias[alias] = url;
              super.sendMessage('browsertime.alias', alias, {
                url,
                group
              });
            } catch (error) {
              log.error(
                'Could not get group for URL:' + url + ' with error' + error
              );
            }
          }
        }

        // If sceenshots is turned on, tell other plugins that we will use it and
        // what type of images that are used (so for exmaple the HTML pluin can create
        // correct links).
        if (options.screenshot) {
          super.sendMessage('browsertime.config', {
            screenshot: true,
            screenshotType: this.screenshotType
          });
        }
        break;
      }
      // Another plugin sent configuration options to Browsertime
      case 'browsertime.config': {
        _merge(options, message.data);
        break;
      }

      case 'axe.setup': {
        this.axeVersion = message.data.version;
        break;
      }
      // Andother plugin got JavaScript that they want to run in Browsertime
      case 'browsertime.scripts': {
        if (message.data.category && message.data.scripts) {
          log.verbose('Got browsertime.scripts message:' + message);
          this.pluginScripts.push(message.data);
        } else {
          log.error(
            'Got wrong formated browsertime.scripts. You need category and scripts:' +
              message.data
          );
        }
        break;
      }
      // Andother plugin got async JavaScript that they want to run in Browsertime
      case 'browsertime.asyncscripts': {
        if (message.data.category && message.data.scripts) {
          log.verbose('Got browsertime.asyncscripts message:' + message);
          this.pluginAsyncScripts.push(message.data);
        } else {
          log.error(
            'Got wrong formated browsertime.asyncscripts. You need category and scripts:' +
              message.data
          );
        }
        break;
      }
      // We got a URL that we want to test
      case 'browsertime.navigationScripts':
      case 'url': {
        await processUrl(
          message,
          {
            options: this.options,
            allOptions: this.allOptions,
            storageManager: this.storageManager,
            resultUrls: this.resultUrls,
            scriptOrMultiple: this.scriptOrMultiple,
            pluginScripts: this.pluginScripts,
            pluginAsyncScripts: this.pluginAsyncScripts,
            allAlias: this.allAlias,
            firstParty: this.firstParty,
            screenshotType: this.screenshotType,
            browsertimeAggregator: this.browsertimeAggregator,
            useAxe: this.useAxe,
            axeAggregatorTotal: this.axeAggregatorTotal,
            axeVersion: this.axeVersion
          },
          this.sendMessage.bind(this)
        );
        break;
      }
      // It's time to summarize the metrics for all pages and runs
      // and post the summary on the queue
      case 'sitespeedio.summarize': {
        log.debug('Generate summary metrics from Browsertime');
        const summary = this.browsertimeAggregator.summarize();
        if (summary) {
          for (let group of Object.keys(summary.groups)) {
            super.sendMessage('browsertime.summary', summary.groups[group], {
              group
            });
          }
        }

        if (this.useAxe) {
          super.sendMessage(
            'axe.summary',
            this.axeAggregatorTotal.summarizeStats(),
            {
              group: 'total'
            }
          );
        }

        break;
      }
    }
  }
}

export { browsertimeDefaultSettings as config } from './default/config.js';
