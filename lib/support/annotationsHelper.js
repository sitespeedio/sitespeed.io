'use strict';

module.exports = {
  getAnnotationMessage(
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
    } else if (webPageTestResultURL) {
      screenshotPath =
        absolutePagePath + 'data/screenshots/wpt-1-firstView.png';
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
      options.influxdb.annotationMessage ||
      options.grafana.annotationMessage ||
      undefined;

    const s = options.browsertime.iterations > 1 ? 's' : '';

    let message =
      (screenShotsEnabledInBrowsertime || webPageTestResultURL) &&
      screenshotsEnabledForDatasource
        ? `<a href='${resultPageUrl}' target='_blank'><img src='${screenshotPath}' ${screenshotSize}></a><p><a href='${resultPageUrl}'>Result</a> - <a href='${harPath}'>Download HAR</a></p>`
        : `<a href='${resultPageUrl}' target='_blank'>Result ${options.browsertime.iterations} run${s}</a>`;

    if (webPageTestResultURL) {
      message = message + ` <a href='${webPageTestResultURL}'>WebPageTest</a>`;
    }

    if (extraMessage) {
      message = message + ' - ' + extraMessage;
    }
    return message;
  },
  getTagsAsString(tags) {
    return '"' + tags.join(',') + '"';
  },
  getTagsAsArray(tags) {
    const stringTags = [];
    for (let tag of tags) {
      stringTags.push('"' + tag + '"');
    }
    return '[' + stringTags.join(',') + ']';
  }
};
