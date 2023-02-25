import { messageMaker } from '../support/messageMaker.js';

const make = messageMaker('script-reader').make;

export function findUrls(queue, options) {
  queue.postMessage(
    make('browsertime.navigationScripts', {}, { url: options.urls })
  );
}
