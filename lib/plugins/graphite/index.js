import merge from 'lodash.merge';
import get from 'lodash.get';
import dayjs from 'dayjs';
import { getLogger } from '@sitespeed.io/log';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

import { isEmpty } from '../../support/util.js';

import { send } from './send-annotation.js';
import { GraphiteDataGenerator as DataGenerator } from './data-generator.js';
import { isStatsD } from './helpers/is-statsd.js';
import { throwIfMissing } from '../../support/util.js';
import { toArray } from '../../support/util.js';
import { GraphiteSender } from './graphite-sender.js';
import { StatsDSender } from './statsd-sender.js';

const log = getLogger('sitespeedio.plugin.graphite');

export default class GraphitePlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'graphite', options, context, queue });
  }

  open(context, options) {
    throwIfMissing(options.graphite, ['host'], 'graphite');

    if (!options.graphite.addSlugToKey) {
      log.warning(
        'You should convert your Graphite data and start using the test slug. See https://www.sitespeed.io/documentation/sitespeed.io/graphite/#upgrade-to-use-the-test-slug-in-the-namespace'
      );
    }

    const options_ = merge({}, this.config, options.graphite);
    this.options = options;
    this.perIteration = get(options_, 'perIteration', false);
    const SenderConstructor = isStatsD(options_)
      ? StatsDSender
      : GraphiteSender;

    this.filterRegistry = context.filterRegistry;
    this.sender = new SenderConstructor(
      options_.host,
      options_.port,
      options_.bulkSize
    );
    this.dataGenerator = new DataGenerator(
      options_.namespace,
      options_.includeQueryParams,
      options
    );
    log.debug(
      'Setting up Graphite %s:%s for namespace %s',
      options_.host,
      options_.port,
      options_.namespace
    );
    this.timestamp = context.timestamp;
    this.resultUrls = context.resultUrls;
    this.messageTypesToFireAnnotations = [];
    this.receivedTypesThatFireAnnotations = {};
    this.make = context.messageMaker('graphite').make;
    this.sendAnnotation = options_.sendAnnotation;
    this.alias = {};
    this.wptExtras = {};
    this.usingBrowsertime = false;
    this.types = toArray(options.graphite.messages);
  }

  processMessage(message, queue) {
    // First catch if we are running Browsertime
    switch (message.type) {
      case 'browsertime.setup': {
        this.messageTypesToFireAnnotations.push('browsertime.pageSummary');
        this.usingBrowsertime = true;

        break;
      }
      case 'browsertime.config': {
        if (message.data.screenshot) {
          this.useScreenshots = message.data.screenshot;
          this.screenshotType = message.data.screenshotType;
        }

        break;
      }
      case 'sitespeedio.setup': {
        // Let other plugins know that the Graphite plugin is alive
        queue.postMessage(this.make('graphite.setup'));

        break;
      }
      case 'grafana.setup': {
        this.sendAnnotation = false;

        break;
      }
      case 'browsertime.browser': {
        this.browser = message.data.browser;

        break;
      }
    }

    if (message.type === 'browsertime.alias') {
      this.alias[message.url] = message.data;
    }

    const types = message.type.split('.');
    if (types.length > 1) {
      if (!this.types.includes(types[1])) {
        return;
      }
    } else return;

    if (this.messageTypesToFireAnnotations.includes(message.type)) {
      this.receivedTypesThatFireAnnotations[message.url]
        ? this.receivedTypesThatFireAnnotations[message.url]++
        : (this.receivedTypesThatFireAnnotations[message.url] = 1);
    }

    // we only sends individual groups to Graphite, not the
    // total of all groups (you can calculate that yourself)
    if (message.group === 'total') {
      return;
    }
    const filterRegistry = this.filterRegistry;
    message = filterRegistry.filterMessage(message);
    if (isEmpty(message.data)) return;

    // TODO Here we could add logic to either create a new timestamp or
    // use the one that we have for that run. Now just use the one for the
    // run
    let timestamp = this.timestamp;
    if (
      message.type === 'browsertime.run' ||
      message.type === 'browsertime.pageSummary'
    ) {
      timestamp = dayjs(message.runTime);
    }
    const dataPoints = this.dataGenerator.dataFromMessage(
      message,
      timestamp,
      this.alias
    );

    if (dataPoints.length > 0) {
      const data = dataPoints.join('\n') + '\n';
      return this.sender.send(data).then(() => {
        // Make sure we only send the annotation once per URL:
        // If we run browsertime, always send on browsertime.pageSummary
        // If we run WebPageTest standalone, send on webPageTestSummary
        // when we configured a base url

        if (
          this.receivedTypesThatFireAnnotations[message.url] ===
            this.messageTypesToFireAnnotations.length &&
          this.resultUrls.hasBaseUrl() &&
          this.sendAnnotation &&
          message.type === 'browsertime.pageSummary'
        ) {
          this.receivedTypesThatFireAnnotations[message.url] = 0;
          const absolutePagePath = this.resultUrls.absoluteSummaryPagePath(
            message.url,
            this.alias[message.url]
          );

          const timestamp =
            message.type === 'browsertime.pageSummary'
              ? dayjs(message.runTime)
              : this.timestamp;

          return send(
            message.url,
            message.group,
            absolutePagePath,
            this.useScreenshots,
            this.screenshotType,
            timestamp,
            this.alias,
            this.wptExtras[message.url],
            this.usingBrowsertime,
            this.browser,
            this.options
          );
        }
      });
    } else {
      return Promise.reject(
        new Error(
          'No data to send to graphite for message:\n' +
            JSON.stringify(message, undefined, 2)
        )
      );
    }
  }
}
