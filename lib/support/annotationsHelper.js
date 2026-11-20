export function getAnnotationMessage(
  absolutePagePath,
  screenShotsEnabledInBrowsertime,
  screenshotType,
  webPageTestResultURL,
  usingBrowsertime,
  options
) {
  const resultPageUrl = absolutePagePath + 'index.html';
  let screenshotPath;
  if (screenShotsEnabledInBrowsertime) {
    screenshotPath =
      absolutePagePath +
      'data/screenshots/1/afterPageCompleteCheck.' +
      screenshotType;
  }

  const screenshotsEnabledForDatasource =
    options.graphite.annotationScreenshot ||
    (options.influxdb && options.influxdb.annotationScreenshot) ||
    options.grafana.annotationScreenshot;
  const harPath =
    absolutePagePath +
    'data/' +
    (usingBrowsertime ? 'browsertime.har' : 'webpagetest.har') +
    (options.gzipHAR ? '.gz' : '');

  const extraMessage =
    options.graphite.annotationMessage ||
    (options.influxdb && options.influxdb.annotationMessage) ||
    options.grafana.annotationMessage ||
    undefined;

  const s = options.browsertime.iterations > 1 ? 's' : '';

  let message =
    screenShotsEnabledInBrowsertime && screenshotsEnabledForDatasource
      ? `<a href='${resultPageUrl}' target='_blank'><img src='${screenshotPath}' style='max-width:400px'></a><p><a href='${resultPageUrl}'>Result</a> - <a href='${harPath}'>Download HAR</a></p>`
      : `<a href='${resultPageUrl}' target='_blank'>Result ${options.browsertime.iterations} run${s}</a>`;

  // Without --resultBaseURL there is no result page to link to
  if (!absolutePagePath) {
    message = `${options.browsertime.iterations} run${s}`;
  }

  if (extraMessage) {
    message = message + ' - ' + extraMessage;
  }
  return message;
}
export function getTagsAsString(tags) {
  return '"' + tags.join(',') + '"';
}
export function getTagsAsArray(tags) {
  const stringTags = [];
  for (let tag of tags) {
    stringTags.push('"' + tag + '"');
  }
  return '[' + stringTags.join(',') + ']';
}

// The upload plugins send <name>.setup when they start and <name>.finished
// when the upload is done, also when it failed.
const uploadPlugins = new Set(['gcs', 'rsync', 's3', 'scp']);

/**
 * An annotation links to the result, but the result is uploaded after all
 * pages are tested. Keep the annotations until the upload is done, so that
 * the link works when the annotation shows up in Grafana.
 */
export class AnnotationQueue {
  constructor() {
    this.uploads = new Set();
    this.waiting = [];
  }

  // Returns a promise when the last upload is done and the annotations are sent
  onMessage(message) {
    const [plugin, event] = message.type.split('.');
    if (!uploadPlugins.has(plugin)) {
      return;
    }
    if (event === 'setup') {
      this.uploads.add(plugin);
    } else if (event === 'finished') {
      this.uploads.delete(plugin);
      if (this.uploads.size === 0) {
        return this.flush();
      }
    }
  }

  send(sendAnnotation) {
    if (this.uploads.size === 0) {
      return sendAnnotation();
    }
    this.waiting.push(sendAnnotation);
  }

  // Also call it when the run ends: without the HTML report nothing is uploaded
  flush() {
    const waiting = this.waiting;
    this.waiting = [];
    return Promise.all(waiting.map(sendAnnotation => sendAnnotation()));
  }
}
