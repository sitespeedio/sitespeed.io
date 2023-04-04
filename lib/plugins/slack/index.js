import { promisify } from 'node:util';

import intel from 'intel';
import Slack from 'node-slack';
import merge from 'lodash.merge';
import set from 'lodash.set';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

import { DataCollector } from './dataCollector.js';
import { getAttachements } from './attachements.js';
import { getSummary } from './summary.js';
import { throwIfMissing } from '../../support/util.js';

const log = intel.getLogger('sitespeedio.plugin.slack');

const defaultConfig = {
  userName: 'Sitespeed.io',
  type: 'all',
  limitWarning: 90,
  limitError: 80,
  limitMetric: 'coachScore'
};

function send(options, dataCollector, context, screenshotType, alias) {
  const slackOptions = merge({}, defaultConfig, options.slack);
  const slack = new Slack(slackOptions.hookUrl);
  const send = promisify(slack.send.bind(slack));
  const type = slackOptions.type;
  const pageErrors = [];
  let logo = 'https://www.sitespeed.io/img/slack/sitespeed-logo-slack.png';

  let channel = slackOptions.channel;
  if (channel && !channel.startsWith('#')) {
    channel = `#${channel}`;
  }

  for (const url of dataCollector.getURLs()) {
    const errors = dataCollector.getURLData(url).errors;

    if (errors) {
      pageErrors.push(errors);
    }
  }

  let text = '';

  if (['summary', 'all', 'error'].includes(type)) {
    const sum = getSummary(
      dataCollector,
      pageErrors,
      context.resultUrls,
      context.name,
      options
    );
    text += sum.summaryText + '\n' + sum.errorText;
    logo = sum.logo;
  }

  let attachments = [];
  if (['url', 'all', 'error'].includes(type)) {
    attachments = getAttachements(
      dataCollector,
      context.resultUrls,
      slackOptions,
      screenshotType,
      alias
    );
  }

  if ((type === 'error' && pageErrors.length > 0) || type !== 'error') {
    log.debug(
      'Sending message to Slack channel %s and username %s',
      slackOptions.channel,
      slackOptions.userName
    );
    return send({
      text,
      icon_url: logo,
      channel,
      mrkdwn: true,
      username: slackOptions.userName,
      attachments
    }).catch(error => {
      if (error.errno === 'ETIMEDOUT') {
        log.warn('Timeout sending Slack message.');
      } else {
        throw error;
      }
    });
  }
}

/**
 * Detect configurations for a static website provider and return its name.
 *
 * @param {object} options
 * @return {string?} The provider name  (if any could be detected)
 */
function staticPagesProvider(options) {
  const s3Options = options.s3;
  try {
    throwIfMissing(s3Options, ['bucketname'], 's3');
    if (s3Options.key || s3Options.secret) {
      throwIfMissing(s3Options, ['key', 'secret'], 's3');
    }
    return 's3';
  } catch {
    log.debug('s3 is not configured');
  }

  const gcsOptions = options.gcs;
  try {
    throwIfMissing(gcsOptions, ['projectId', 'key', 'bucketname'], 'gcs');
    return 'gcs';
  } catch {
    log.debug('gcs is not configured');
  }

  return;
}

export default class SlackPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'slack', options, context, queue });
  }

  open(context, options = {}) {
    const slackOptions = options.slack || {};
    throwIfMissing(slackOptions, ['hookUrl', 'userName'], 'slack');
    this.dataCollector = new DataCollector(context);
    this.context = context;
    this.options = options;
    this.screenshotType;
    this.alias = {};
  }
  processMessage(message) {
    const dataCollector = this.dataCollector;

    switch (message.type) {
      case 'browsertime.alias': {
        this.alias[message.url] = message.data;
        break;
      }
      case 'error': {
        if (message.url) {
          dataCollector.addErrorForUrl(
            message.url,
            message.source,
            message.data,
            this.alias[message.url]
          );
        } else {
          dataCollector.addError(message.source, message.data);
        }
        break;
      }

      case 'browsertime.run':
      case 'browsertime.pageSummary':
      case 'pagexray.run':
      case 'pagexray.pageSummary':
      case 'coach.run':
      case 'coach.pageSummary': {
        dataCollector.addDataForUrl(
          message.url,
          message.type,
          message.data,
          message.runIndex,
          this.alias[message.url]
        );
        break;
      }

      case 'coach.summary':
      case 'pagexray.summary':
      case 'browsertime.summary': {
        const data = {};
        set(data, message.type, message.data);
        dataCollector.addSummary(data);
        break;
      }
      // collect screenshot type
      case 'browsertime.config': {
        if (message.data.screenshot === true) {
          this.screenshotType = message.data.screenshotType;
        }
        break;
      }

      case 'remove.url': {
        dataCollector.removeUrl(message.url);
        break;
      }

      case 'html.finished': {
        const provider = staticPagesProvider(this.options);
        if (provider) {
          log.debug(
            'A static website hosting provider (%s) is configured. ' +
              'The Slack message should be sent after the HTML report is uploaded',
            provider
          );
        } else {
          // Send the notification right away if no static website provider was configured
          return send(
            this.options,
            dataCollector,
            this.context,
            this.screenshotType,
            this.alias
          );
        }
        break;
      }

      case 'gcs.finished':
      case 'ftp.finished':
      case 'scp.finished':
      case 's3.finished': {
        return send(
          this.options,
          dataCollector,
          this.context,
          this.screenshotType,
          this.alias
        );
      }
    }
  }
}
export const config = defaultConfig;
