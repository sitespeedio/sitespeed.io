import { config as metricsConfig } from '../../plugins/metrics/index.js';

export function addOptions(yargs) {
  yargs
    .option('metrics.list', {
      describe: 'List all possible metrics in the data folder (metrics.txt).',
      type: 'boolean',
      default: metricsConfig.list,
      group: 'Metrics'
    })
    .option('metrics.filterList', {
      describe:
        'List all configured filters for metrics in the data folder (configuredMetrics.txt)',
      type: 'boolean',
      default: metricsConfig.filterList,
      group: 'Metrics'
    })
    .option('metrics.filter', {
      type: 'array',
      describe:
        'Add/change/remove filters for metrics. If you want to send all metrics, use: *+ . If you want to remove all current metrics and send only the coach score: *- coach.summary.score.*',
      group: 'Metrics'
    });
}
