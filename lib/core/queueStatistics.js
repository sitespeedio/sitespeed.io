'use strict';

const stats = require('../support/statsHelpers'),
  get = require('lodash.get'),
  set = require('lodash.set');

const queueTimeByPluginName = {},
  queueTimeByMessageType = {},
  processingTimeByPluginName = {},
  processingTimeByMessageType = {},
  messageTypes = new Set(),
  pluginNames = new Set();

module.exports = {
  registerQueueTime(message, plugin, nanos) {
    messageTypes.add(message.type);
    pluginNames.add(plugin.name());

    stats.pushStats(queueTimeByMessageType, message.type, nanos / 1000000);
    stats.pushStats(queueTimeByPluginName, plugin.name(), nanos / 1000000);
  },

  registerProcessingTime(message, plugin, nanos) {
    messageTypes.add(message.type);
    pluginNames.add(plugin.name());

    stats.pushStats(processingTimeByMessageType, message.type, nanos / 1000000);
    stats.pushStats(processingTimeByPluginName, plugin.name(), nanos / 1000000);
  },

  generateStatistics() {
    const statOptions = {
      percentiles: [0, 100],
      includeSum: true
    };

    const byPluginName = Array.from(pluginNames).reduce(
      (summary, pluginName) => {
        set(
          summary,
          ['queueTime', pluginName],
          stats.summarizeStats(
            get(queueTimeByPluginName, pluginName),
            statOptions
          )
        );
        set(
          summary,
          ['processingTime', pluginName],
          stats.summarizeStats(
            get(processingTimeByPluginName, pluginName),
            statOptions
          )
        );

        return summary;
      },
      {}
    );

    const byMessageType = Array.from(messageTypes).reduce(
      (summary, messageType) => {
        set(
          summary,
          ['queueTime', messageType],
          stats.summarizeStats(
            get(queueTimeByMessageType, messageType),
            statOptions
          )
        );
        set(
          summary,
          ['processingTime', messageType],
          stats.summarizeStats(
            get(processingTimeByMessageType, messageType),
            statOptions
          )
        );

        return summary;
      },
      {}
    );

    return {
      byPluginName,
      byMessageType
    };
  }
};
