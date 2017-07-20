'use strict';

/* eslint no-console:0 */

const cq = require('concurrent-queue'),
  Promise = require('bluebird'),
  util = require('util'),
  log = require('intel').getLogger('sitespeedio.queuehandler'),
  messageMaker = require('../support/messageMaker'),
  queueStats = require('../support/queueStatistics');

const make = messageMaker('queueHandler').make;

function shortenData(key, value) {
  if (key === 'data') {
    return '{...}';
  }
  return value;
}

const messageTypeDepths = {};

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
        util.format(
          'All messages of type %s must have the same structure. ' +
            '%s has %d part(s), but earlier messages had %d part(s).',
          baseType,
          message.type,
          typeDepth,
          previousDepth
        )
      );
    }

    messageTypeDepths[baseType] = typeDepth;
  }

  function validateSummaryMessages(message) {
    const type = message.type;
    if (type.endsWith('.summary') && message.url) {
      throw new Error(
        util.format(
          "Summary message (%s) shouldn't be url specific, use .pageSummary instead.",
          type
        )
      );
    }

    if (type.endsWith('.pageSummary') && !message.url) {
      throw new Error(
        util.format('Page summary message (%s) failed to specify a url', type)
      );
    }
  }

  validateTypeStructure(message);
  validateSummaryMessages(message);
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

  run(sources) {
    return Promise.map(sources, source => source.findUrls(this))
      .then(() => this.startProcessingQueues())
      .then(() => this.drainAllQueues())
      .then(() => this.postMessage(make('summarize')))
      .then(() => this.drainAllQueues())
      .then(() => {
        if (this.options.queueStats) {
          log.info(JSON.stringify(queueStats.generateStatistics(), null, 2));
        }
      })
      .return(this.errors);
  }

  postMessage(message) {
    validateMessageFormat(message);

    // Don't return promise in loop - we don't want to wait for completion,
    // just post the message.
    for (let item of this.queues) {
      item.queue(message);
    }
  }

  startProcessingQueues() {
    return Promise.each(this.queues, item => {
      const queue = item.queue,
        plugin = item.plugin;
      queue.process(message =>
        Promise.resolve(plugin.processMessage(message, this))
      );
    });
  }

  drainAllQueues() {
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
