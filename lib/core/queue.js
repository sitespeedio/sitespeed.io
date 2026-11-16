// Simplified implementation of concurrent-queue
// https://www.npmjs.com/package/concurrent-queue

export function createQueue() {
  let concurrency = Number.POSITIVE_INFINITY;
  let processor;

  const tasks = [];
  let runningCount = 0;

  const enqueuedCallbacks = [];
  const processingStartedCallbacks = [];
  const processingEndedCallbacks = [];
  const drainedCallbacks = [];

  /**
   * We will trigger drained callbacks when:
   *   tasks.length === 0 and runningCount === 0
   */
  function checkDrained() {
    if (tasks.length === 0 && runningCount === 0) {
      for (const cb of drainedCallbacks) {
        cb();
      }
    }
  }

  /**
   * Attempt to start processing more tasks if we have
   * capacity (runningCount < concurrency).
   */
  function tryProcessNext() {
    while (tasks.length > 0 && runningCount < concurrency) {
      const item = tasks.shift();
      runningCount++;

      for (const cb of processingStartedCallbacks) {
        cb({ item });
      }

      const promise = Promise.resolve(processor(item));

      promise
        .then(() => {
          // Fire processingEnded callbacks
          for (const cb of processingEndedCallbacks) {
            cb({ item, err: undefined });
          }
        })
        .catch(error => {
          // Fire processingEnded callbacks with an error
          for (const cb of processingEndedCallbacks) {
            cb({ item, err: error });
          }
        })
        .finally(() => {
          runningCount--;
          checkDrained();
          tryProcessNext();
        });
    }
  }

  const queue = function enqueue(item) {
    for (const cb of enqueuedCallbacks) {
      cb({ item });
    }
    tasks.push(item);

    tryProcessNext();
  };

  queue.limit = options => {
    if (options && typeof options.concurrency === 'number') {
      concurrency = options.concurrency;
    }
    return queue;
  };

  queue.process = fn => {
    processor = fn;
    return queue;
  };

  queue.enqueued = callback => {
    enqueuedCallbacks.push(callback);
    return queue;
  };

  queue.processingStarted = callback => {
    processingStartedCallbacks.push(callback);
    return queue;
  };

  queue.processingEnded = callback => {
    processingEndedCallbacks.push(callback);
    return queue;
  };

  queue.drained = callback => {
    drainedCallbacks.push(callback);
    return queue;
  };

  Object.defineProperty(queue, 'isDrained', {
    get() {
      return tasks.length === 0 && runningCount === 0;
    }
  });

  return queue;
}
