import get from 'lodash.get';
import set from 'lodash.set';

import { pushStats, summarizeStats } from '../support/statsHelpers.js';

const queueTimeByPluginName = {},
  queueTimeByMessageType = {},
  processingTimeByPluginName = {},
  processingTimeByMessageType = {},
  messageTypes = new Set(),
  pluginNames = new Set();

export function registerQueueTime(message, plugin, nanos) {
  messageTypes.add(message.type);
  pluginNames.add(plugin.getName());

  pushStats(queueTimeByMessageType, message.type, nanos / 1_000_000);
  pushStats(queueTimeByPluginName, plugin.getName(), nanos / 1_000_000);
}
export function registerProcessingTime(message, plugin, nanos) {
  messageTypes.add(message.type);
  pluginNames.add(plugin.getName());

  pushStats(processingTimeByMessageType, message.type, nanos / 1_000_000);
  pushStats(processingTimeByPluginName, plugin.getName(), nanos / 1_000_000);
}
export function generateStatistics() {
  const statOptions = {
    percentiles: [0, 100],
    includeSum: true
  };

  const byPluginName = [...pluginNames].reduce((summary, pluginName) => {
    set(
      summary,
      ['queueTime', pluginName],
      summarizeStats(get(queueTimeByPluginName, pluginName), statOptions)
    );
    set(
      summary,
      ['processingTime', pluginName],
      summarizeStats(get(processingTimeByPluginName, pluginName), statOptions)
    );

    return summary;
  }, {});

  const byMessageType = [...messageTypes].reduce((summary, messageType) => {
    set(
      summary,
      ['queueTime', messageType],
      summarizeStats(get(queueTimeByMessageType, messageType), statOptions)
    );
    set(
      summary,
      ['processingTime', messageType],
      summarizeStats(get(processingTimeByMessageType, messageType), statOptions)
    );

    return summary;
  }, {});

  return {
    byPluginName,
    byMessageType
  };
}
