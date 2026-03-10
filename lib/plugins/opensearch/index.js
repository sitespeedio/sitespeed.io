import { getLogger } from '@sitespeed.io/log';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

import { throwIfMissing } from '../../support/util.js';
import { OpenSearchSender } from './sender.js';
import { OpenSearchDataGenerator } from './data-generator.js';

const log = getLogger('sitespeedio.plugin.opensearch');

export default class OpenSearchPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'opensearch', options, context, queue });
  }

  async open(context, options) {
    throwIfMissing(options.opensearch, ['host'], 'opensearch');

    const o = options.opensearch;
    this.options = options;
    this.dataGenerator = new OpenSearchDataGenerator(options);
    this.sender = new OpenSearchSender(o.host, o.port, o.index, {
      secure: o.secure ?? false,
      username: o.username,
      password: o.password
    });
    this.alias = {};
    this.resultUrls = context.resultUrls;
    this.includeRuns = o.includeRuns ?? false;

    const runDays = o.runRetentionDays ?? 7;
    const defaultDays = o.retentionDays ?? 90;

    log.info(
      'Setting up OpenSearch %s:%s index prefix: %s, run retention: %dd, summary retention: %dd',
      o.host,
      o.port ?? 9200,
      o.index ?? 'sitespeed',
      runDays,
      defaultDays
    );

    try {
      await this.sender.putISMPolicy('sitespeed-run-retention', `${runDays}d`);
      await this.sender.putISMPolicy(
        'sitespeed-default-retention',
        `${defaultDays}d`
      );
      log.debug('OpenSearch ISM retention policies created/updated');
    } catch (error) {
      log.warning(
        'Could not create OpenSearch ISM retention policies: %s',
        error.message
      );
    }
  }

  processMessage(message) {
    if (message.type === 'browsertime.alias') {
      this.alias[message.url] = message.data;
      return;
    }

    if (message.type === 'browsertime.run' && !this.includeRuns) {
      return;
    }

    if (message.group === 'total') {
      return;
    }

    const doc = this.dataGenerator.documentFromMessage(
      message,
      this.alias,
      this.resultUrls
    );
    if (!doc) return;

    const INDEX_TYPES = {
      'browsertime.pageSummary': 'pagesummary',
      'browsertime.run': 'run',
      'pagexray.pageSummary': 'pagexray',
      'compare.pageSummary': 'compare',
      'coach.pageSummary': 'coach'
    };
    const indexType = INDEX_TYPES[message.type] ?? 'pagesummary';

    return this.sender
      .bulk([doc], this.sender.indexName(indexType))
      .catch(error => {
        log.error(
          'Failed to send %s to OpenSearch: %s',
          message.type,
          error.message
        );
      });
  }
}
