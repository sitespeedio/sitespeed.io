'use strict';

/* eslint no-console:0 */

const cq = require('concurrent-queue');
const log = require('intel').getLogger('sitespeedio.queuehandler');
const messageMaker = require('../support/messageMaker');
const queueStats = require('./queueStatistics');

const make = messageMaker('queueHandler').make;

function shortenData(key, value) {
  if (key === 'data') {
    return '{...}';
  }
  return value;
}

const messageTypeDepths = {};
const groupsPerSummaryType = {};

/**
 * Check some message format best practices that applies to sitespeed.io.
 * Throws an error if message doesn't follow the rules.
 * @param message the message to check
 */
function validateMessageFormat(message) {
  function validateTypeStructure(message) {
    const typeParts = message.type.split('.'),
      baseType = typeParts[0],
      typeDepth = typeParts.length;

    if (typeDepth > 2)
      throw new Error(
        'Message type has too many dot separated sections: ' + message.type
      );

    const previousDepth = messageTypeDepths[baseType];

    if (previousDepth && previousDepth !== typeDepth) {
      throw new Error(
        `All messages of type ${baseType} must have the same structure. ` +
          `${message.type} has ${typeDepth} part(s), but earlier messages had ${previousDepth} part(s).`
      );
    }

    messageTypeDepths[baseType] = typeDepth;
  }

  function validatePageSummary(message) {
    const type = message.type;
    if (!type.endsWith('.pageSummary')) return;

    if (!message.url)
      throw new Error(`Page summary message (${type}) didn't specify a url`);

    if (!message.group)
      throw new Error(`Page summary message (${type}) didn't specify a group.`);
  }

  function validateSummaryMessage(message) {
    const type = message.type;
    if (!type.endsWith('.summary')) return;

    if (message.url)
      throw new Error(
        `Summary message (${type}) shouldn't be url specific, use .pageSummary instead.`
      );

    if (!message.group)
      throw new Error(`Summary message (${type}) didn't specify a group.`);

    const groups = groupsPerSummaryType[type] || [];
    if (groups.includes(message.group)) {
      throw new Error(
        `Multiple summary messages of type ${type} and group ${message.group}`
      );
    }
    groupsPerSummaryType[type] = groups.concat(message.group);
  }

  validateTypeStructure(message);
  validatePageSummary(message);
  validateSummaryMessage(message);
}

class QueueHandler {
  constructor(plugins, options) {
    this.options = options;
    this.errors = [];

    this.createQueues(plugins);
  }

  createQueues(plugins) {
    this.queues = plugins
      .filter(plugin => plugin.processMessage)
      .map(plugin => {
        const concurrency = plugin.concurrency || Infinity;
        const queue = cq().limit({ concurrency });

        queue.plugin = plugin;

        const messageWaitingStart = {},
          messageProcessingStart = {};

        queue.enqueued(obj => {
          const message = obj.item;
          messageWaitingStart[message.uuid] = process.hrtime();
        });

        queue.processingStarted(obj => {
          const message = obj.item;

          const waitingDuration = process.hrtime(
              messageWaitingStart[message.uuid]
            ),
            waitingNanos = waitingDuration[0] * 1e9 + waitingDuration[1];

          queueStats.registerQueueTime(message, queue.plugin, waitingNanos);

          messageProcessingStart[message.uuid] = process.hrtime();
        });

        // FIXME handle rejections (i.e. failures while processing messages) properly
        queue.processingEnded(obj => {
          const message = obj.item;
          const err = obj.err;
          if (err) {
            let rejectionMessage =
              'Rejected ' +
              JSON.stringify(message, shortenData, 2) +
              ' for plugin: ' +
              plugin.name();

            if (message && message.url)
              rejectionMessage += ', url: ' + message.url;

            if (err.stack) {
              log.error(err.stack);
            }
            this.errors.push(rejectionMessage + '\n' + JSON.stringify(err));
          }

          const processingDuration = process.hrtime(
            messageWaitingStart[message.uuid]
          );
          const processingNanos =
            processingDuration[0] * 1e9 + processingDuration[1];

          queueStats.registerProcessingTime(
            message,
            queue.plugin,
            processingNanos
          );
        });

        return { plugin, queue };
      });
  }
  async run(sources) {
    /*
   setup - plugins chance to talk to each other or setup what they need.
   url - urls passed around to analyse
   summarize - all analyse is finished and we can summarize all data
   prepareToRender - prepare evertything to render, send messages after things been summarized etc
   render - plugin store data to disk
   final - is there anything you wanna do before sitespeed exist? upload files to the S3?
   */
    return this.startProcessingQueues()
      .then(() => this.postMessage(make('sitespeedio.setup')))
      .then(() => this.drainAllQueues())
      .then(async () => {
        for (let source of sources) {
          await source.findUrls(this);
        }
      })
      .then(() => this.drainAllQueues())
      .then(() => this.postMessage(make('sitespeedio.summarize')))
      .then(() => this.drainAllQueues())
      .then(() => this.postMessage(make('sitespeedio.prepareToRender')))
      .then(() => this.drainAllQueues())
      .then(() => this.postMessage(make('sitespeedio.render')))
      .then(() => this.drainAllQueues())
      .then(() => {
        if (this.options.queueStats) {
          log.info(JSON.stringify(queueStats.generateStatistics(), null, 2));
        }
        return this.errors;
      });
  }

  postMessage(message) {
    validateMessageFormat(message);

    // if we get a error message on the queue make sure we register that
    if (message.type === 'error' || message.type.endsWith('.error')) {
      this.errors.push('' + message.data);
    }

    // Don't return promise in loop - we don't want to wait for completion,
    // just post the message.
    for (let item of this.queues) {
      item.queue(message);
    }
  }

  async startProcessingQueues() {
    for (let item of this.queues) {
      const queue = item.queue,
        plugin = item.plugin;
      queue.process(message =>
        Promise.resolve(plugin.processMessage(message, this))
      );
    }
  }

  async drainAllQueues() {
    const queues = this.queues;
    return new Promise(resolve => {
      queues.forEach(item =>
        item.queue.drained(() => {
          if (queues.every(item => item.queue.isDrained)) {
            resolve();
          }
        })
      );
    });
  }
}

module.exports = QueueHandler;
