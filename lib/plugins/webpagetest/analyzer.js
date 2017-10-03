'use strict';

const fs = require('fs');
const Promise = require('bluebird');
const log = require('intel').getLogger('sitespeedio.plugin.webpagetest');
const clone = require('lodash.clonedeep');
const get = require('lodash.get');
const WebPageTest = require('webpagetest');
const WPTAPIError = require('webpagetest/lib/helper').WPTAPIError;

Promise.promisifyAll(fs);
Promise.promisifyAll(WebPageTest.prototype);

module.exports = {
  analyzeUrl(url, storageManager, wptOptions) {
    const wptClient = new WebPageTest(wptOptions.host, wptOptions.key);
    wptOptions.firstViewOnly = !wptOptions.includeRepeatView;
    let urlOrScript = url;

    log.info('Sending url ' + url + ' to test on ' + wptOptions.host);
    if (wptOptions.script) {
      urlOrScript = wptOptions.script.split('{{{URL}}}').join(url);
    }

    // See https://github.com/sitespeedio/sitespeed.io/issues/1367
    const options = clone(wptOptions);
    return wptClient.runTestAsync(urlOrScript, options).then(function(data) {
      const id = data.data.id;
      log.info('Got %s analysed with id %s from %s', url, id, options.host);
      log.verbose('Got JSON from WebPageTest :%:2j', data);

      // Something failed with WebPageTest but how should we handle that?
      if (data.statusCode !== 200) {
        log.error(
          'The test got status code %s from WebPageTest with %s. Checkout %s to try to find the original reason.',
          data.statusCode,
          data.statusText,
          get(data, 'data.summary')
        );
      }

      const promises = [];
      let har;
      promises.push(
        wptClient
          .getHARDataAsync(id, {})
          .then(theHar => (har = theHar))
          .catch(WPTAPIError, error =>
            log.warn(
              `Couldn't get HAR for id ${id} ${error.message} (url = ${url})`
            )
          )
      );

      const traces = {};
      const views = ['firstView'];
      if (!wptOptions.firstViewOnly) {
        views.push('repeatView');
      }

      views.forEach(function(view) {
        for (let run = 1; run <= wptOptions.runs; run++) {
          // The WPT API wrapper mutates the options object, why ohh why?!?!?!
          const repeatView = view === 'repeatView';

          promises.push(
            wptClient
              .getScreenshotImageAsync(id, { run, repeatView })
              .then(img =>
                storageManager.writeDataForUrl(
                  img,
                  'wpt-' + run + '-' + view + '.png',
                  url,
                  'screenshots'
                )
              )
              .catch(WPTAPIError, error =>
                log.warn(
                  `Couldn't get screenshot for id ${id}, run ${run}: ${error.message} (url = ${url})`
                )
              )
          );

          promises.push(
            wptClient
              .getWaterfallImageAsync(id, { run, repeatView })
              .then(img =>
                storageManager.writeDataForUrl(
                  img,
                  'wpt-waterfall-' + run + '-' + view + '.png',
                  url,
                  'waterfall'
                )
              )
              .catch(WPTAPIError, error =>
                log.warn(
                  `Couldn't get waterfall for id ${id}, run ${run}: ${error.message} (url = ${url})`
                )
              )
          );

          promises.push(
            wptClient
              .getWaterfallImageAsync(id, {
                run,
                chartType: 'connection',
                repeatView
              })
              .then(img =>
                storageManager.writeDataForUrl(
                  img,
                  'wpt-waterfall-connection' + run + '-' + view + '.png',
                  url,
                  'waterfall'
                )
              )
              .catch(WPTAPIError, error =>
                log.warn(
                  `Couldn't get connection waterfall for id ${id}, run ${run}: ${error.message} (url = ${url})`
                )
              )
          );

          if (wptOptions.timeline) {
            promises.push(
              wptClient
                .getChromeTraceDataAsync(id, { run, repeatView })
                .then(
                  trace => (traces['trace-' + run + '-wpt-' + view] = trace)
                )
                .catch(WPTAPIError, error =>
                  log.warn(
                    `Couldn't get chrome trace for id ${id}, run ${run}: ${error.message} (url = ${url})`
                  )
                )
            );
          }
        }
      });
      return Promise.all(promises).then(() => {
        const myResult = {
          data: data.data,
          har
        };
        myResult.trace = traces;
        return myResult;
      });
    });
  }
};
