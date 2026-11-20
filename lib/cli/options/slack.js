import { config as slackConfig } from '../../plugins/slack/index.js';

export function addOptions(yargs) {
  yargs
    .option('slack.hookUrl', {
      describe:
        'WebHook url for the Slack team (check https://<your team>.slack.com/apps/manage/custom-integrations).',
      group: 'Slack'
    })
    .option('slack.userName', {
      describe: 'User name to use when posting status to Slack.',
      default: slackConfig.userName,
      group: 'Slack'
    })
    .option('slack.channel', {
      describe:
        'The slack channel without the # (if something else than the default channel for your hook).',
      group: 'Slack'
    })
    .option('slack.type', {
      describe:
        'Send summary for a tested URL, metrics from all URLs (summary), only on errors from your tests or all to Slack.',
      default: slackConfig.type,
      choices: ['summary', 'url', 'error', 'all'],
      group: 'Slack'
    })
    .option('slack.limitWarning', {
      describe: 'The limit to get a warning in Slack using the limitMetric.',
      default: slackConfig.limitWarning,
      group: 'Slack'
    })
    .option('slack.limitError', {
      describe: 'The limit to get a error in Slack using the limitMetric.',
      default: slackConfig.limitError,
      group: 'Slack'
    })
    .option('slack.limitMetric', {
      describe:
        'The metric that will be used to set warning/error. You can choose only one at the moment.',
      default: slackConfig.limitMetric,
      choices: [
        'coachScore',
        'speedIndex',
        'firstVisualChange',
        'firstPaint',
        'visualComplete85',
        'lastVisualChange',
        'fullyLoaded'
      ],
      group: 'Slack'
    });
}
