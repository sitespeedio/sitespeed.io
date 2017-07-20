'use strict';

var fs = require('fs'),
  Promise = require('bluebird'),
  log = require('intel').getLogger('sitespeedio.plugin.webpagetest'),
  clone = require('lodash.clonedeep'),
  get = require('lodash.get'),
  WebPageTest = require('webpagetest'),
  WPTAPIError = require('webpagetest/lib/helper').WPTAPIError;

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
            log.error('Couldnt get HAR data fir id %s %s', id, error)
          )
      );

      const traces = {};
      const views = ['firstView'];
      if (!wptOptions.firstViewOnly) {
        views.push('repeatView');
      }

      views.forEach(function(view) {
        for (let j = 1; j < wptOptions.runs + 1; j++) {
          // The WPT API wrapper mutates the options object, why ohh why?!?!?!
          const screenShotOptions = {
            run: j,
            repeatView: view === 'repeatView'
          };

          const waterfallOptions = {
            run: j,
            repeatView: view === 'repeatView'
          };

          const connectionOptions = {
            run: j,
            chartType: 'connection',
            repeatView: view === 'repeatView'
          };

          const timelineOptions = {
            run: j,
            repeatView: view === 'repeatView'
          };

          promises.push(
            Promise.join(
              wptClient.getScreenshotImageAsync(id, screenShotOptions),
              j,
              view,
              (result, index, view) =>
                storageManager.writeDataForUrl(
                  result,
                  'wpt-' + index + '-' + view + '.png',
                  url,
                  'screenshots'
                )
            ).catch(WPTAPIError, error =>
              log.error('Couldnt get screenshot for id %s %s', id, error)
            )
          );

          promises.push(
            Promise.join(
              wptClient.getWaterfallImageAsync(id, waterfallOptions),
              j,
              view,
              (result, index, view) => {
                return storageManager
                  .writeDataForUrl(
                    result,
                    'wpt-waterfall-' + index + '-' + view + '.png',
                    url,
                    'waterfall'
                  )
                  .catch(WPTAPIError, error =>
                    log.error('Couldnt get waterfall %s %s', id, error)
                  );
              }
            )
          );

          promises.push(
            Promise.join(
              wptClient.getWaterfallImageAsync(id, connectionOptions),
              j,
              view,
              (result, index, view) =>
                storageManager.writeDataForUrl(
                  result,
                  'wpt-waterfall-connection-' + index + '-' + view + '.png',
                  url,
                  'waterfall'
                )
            ).catch(WPTAPIError, error =>
              log.error(
                'Couldnt get watetfall connection for id %s %s',
                id,
                error
              )
            )
          );
          if (wptOptions.timeline) {
            promises.push(
              Promise.join(
                wptClient.getChromeTraceDataAsync(id, timelineOptions),
                j,
                view,
                (result, index, view) => {
                  traces['trace-' + index + '-wpt-' + view] = result;
                }
              ).catch(WPTAPIError, error =>
                log.error('Couldnt get chrome trace for id %s %s', id, error)
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
