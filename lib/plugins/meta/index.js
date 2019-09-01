'use strict';

const DEFAULT_META_METRICS = ['browser.*', 'totalRunTime.*'];

module.exports = {
  open(context, options) {
    this.meta = { browser: {} };
    this.make = context.messageMaker('meta').make;
    this.options = options;
    context.filterRegistry.registerFilterForType(
      DEFAULT_META_METRICS,
      'sitespeedio.meta'
    );
  },

  processMessage(message, queue) {
    if (message.type === 'sitespeedio.setup') {
      this.start = new Date().getTime();
    }
    if (message.type === 'browsertime.har') {
      const name = message.data.log.browser.name.toLowerCase();
      const version = message.data.log.browser.version;
      if (name && version) {
        this.meta.browser[name] = Number(version.split('.')[0]);
      }
    }
    if (message.type === 'sitespeedio.queueStatistics') {
      const runTimeInMs = new Date().getTime() - this.start;
      this.meta.totalRunTime = runTimeInMs;
      this.meta.plugins = {
        processingTime: message.data.byPluginName.processingTime
      };
      return queue.postMessage(this.make('sitespeedio.meta', this.meta));
    }
  },
  close() {}
};
