export function getAnnotationMessage(
  absolutePagePath,
  screenShotsEnabledInBrowsertime,
  screenshotType,
  webPageTestResultURL,
  usingBrowsertime,
  options
) {
  const screenshotSize = options.mobile ? 'height=200px' : 'width=100%';
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
    options.influxdb.annotationScreenshot ||
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
      ? `<a href='${resultPageUrl}' target='_blank'><img src='${screenshotPath}' ${screenshotSize}></a><p><a href='${resultPageUrl}'>Result</a> - <a href='${harPath}'>Download HAR</a></p>`
      : `<a href='${resultPageUrl}' target='_blank'>Result ${options.browsertime.iterations} run${s}</a>`;

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
