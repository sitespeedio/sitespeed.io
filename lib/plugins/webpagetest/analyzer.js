'use strict';

const clone = require('lodash.clonedeep');
const get = require('lodash.get');
const WebPageTest = require('webpagetest');
const { promisify } = require('util');

module.exports = {
  async analyzeUrl(url, storageManager, log, wptOptions) {
    const wptClient = new WebPageTest(wptOptions.host, wptOptions.key);
    wptOptions.firstViewOnly = !wptOptions.includeRepeatView;
    let urlOrScript = url;

    log.info('Sending url ' + url + ' to test on ' + wptOptions.host);
    if (wptOptions.script) {
      urlOrScript = wptOptions.script.split('{{{URL}}}').join(url);
    }

    // Setup WebPageTest methods
    const runTest = promisify(wptClient.runTest.bind(wptClient));
    const getHARData = promisify(wptClient.getHARData.bind(wptClient));
    const getScreenshotImage = promisify(
      wptClient.getScreenshotImage.bind(wptClient)
    );
    const getWaterfallImage = promisify(
      wptClient.getWaterfallImage.bind(wptClient)
    );
    const getChromeTraceData = promisify(
      wptClient.getChromeTraceData.bind(wptClient)
    );

    // See https://github.com/sitespeedio/sitespeed.io/issues/1367
    const options = clone(wptOptions);

    try {
      const data = await runTest(urlOrScript, options);
      const id = data.data.id;
      log.info('Got %s analysed with id %s from %s', url, id, options.host);
      log.verbose('Got JSON from WebPageTest :%:2j', data);

      // Something failed with WebPageTest but how should we handle that?
      // Also, this doesn't contain every failure case e.g. successfulFV/RVRuns=0 we should include it
      if (data.statusCode !== 200) {
        log.error(
          'The test got status code %s from WebPageTest with %s. Checkout %s to try to find the original reason.',
          data.statusCode,
          data.statusText,
          get(data, 'data.summary')
        );
      } else {
        log.info('WebPageTest result at: ' + data.data.summary);
      }

      if (
        data.data.median.firstView.numSteps &&
        data.data.median.firstView.numSteps > 1
      ) {
        // MULTISTEP
        log.info(
          "Sitespeed.io doesn't support multi step WebPageTest scripting at the moment. Either use sitespeed.io scripting (https://www.sitespeed.io/documentation/sitespeed.io/scripting/) or help us implement support for WebPageTest in https://github.com/sitespeedio/sitespeed.io/issues/2620"
        );
        return;
      }

      // if WPT test has been required with the timeline and chrome, gather additional infos
      // /!\ this mutates data
      if (
        data.statusCode === 200 &&
        data.data.median.firstView &&
        'chromeUserTiming' in data.data.median.firstView
      ) {
        let chromeUserTiming = {};
        // from "chromeUserTiming": [{"name": "unloadEventStart","time": 0}, …]
        // to "chromeUserTiming":{unloadEventStart:0, …}
        data.data.median.firstView.chromeUserTiming.forEach(measure => {
          chromeUserTiming[measure.name] = measure.time;
        });
        data.data.median.firstView.chromeUserTiming = chromeUserTiming;
        log.verbose(
          'detected chromeUserTiming and restructured them to :%:2j',
          chromeUserTiming
        );
      }

      const promises = [];
      let har;
      promises.push(
        getHARData(id, {})
          .then(theHar => (har = theHar))
          .catch(e =>
            log.warn(
              `Couldn't get HAR for id ${id} ${e.message} (url = ${url})`
            )
          )
      );

      const traces = {};
      const views = ['firstView'];
      if (!wptOptions.firstViewOnly) {
        views.push('repeatView');
      }

      for (const view of views) {
        for (let run = 1; run <= wptOptions.runs; run++) {
          // The WPT API wrapper mutates the options object, why ohh why?!?!?!
          const repeatView = view === 'repeatView';

          promises.push(
            getScreenshotImage(id, {
              run,
              repeatView
            })
              .then(img => {
                return storageManager.writeDataForUrl(
                  img,
                  'wpt-' + run + '-' + view + '.png',
                  url,
                  'screenshots'
                );
              })
              .catch(e => {
                log.warn(
                  `Couldn't get screenshot for id ${id}, run ${run} from the WebPageTest API with the error ${
                    e.message
                  } (url = ${url})`
                );
              })
          );

          promises.push(
            getWaterfallImage(id, {
              run,
              repeatView
            })
              .then(img =>
                storageManager.writeDataForUrl(
                  img,
                  'wpt-waterfall-' + run + '-' + view + '.png',
                  url,
                  'waterfall'
                )
              )
              .catch(e =>
                log.warn(
                  `Couldn't get waterfall for id ${id}, run ${run} from the WebPageTest API with the error: ${
                    e.message
                  } (url = ${url})`
                )
              )
          );

          promises.push(
            getWaterfallImage(id, {
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
              .catch(e =>
                log.warn(
                  `Couldn't get connection waterfall for id ${id}, run ${run} from the WebPageTest API with the error: ${
                    e.message
                  } (url = ${url})`
                )
              )
          );

          if (wptOptions.timeline) {
            promises.push(
              getChromeTraceData(id, {
                run,
                repeatView
              })
                .then(
                  trace => (traces['trace-' + run + '-wpt-' + view] = trace)
                )
                .catch(e =>
                  log.warn(
                    `Couldn't get chrome trace for id ${id}, run ${run} from the WebPageTest API with the error: ${
                      e.message
                    } (url = ${url})`
                  )
                )
            );
          }
        }
      }

      await Promise.all(promises);
      const myResult = {
        data: data.data,
        har
      };
      myResult.trace = traces;
      return myResult;
    } catch (e) {
      if (e.error && e.error.code === 'TIMEOUT') {
        log.error(
          'The test for WebPageTest timed out. Is your WebPageTest agent overloaded with work? You can try to increase how long time to wait for tests to finish by configuring --webpagetest.timeout to a higher value (default is 600 and is in seconds). ',
          e
        );
      } else {
        log.error('Could not run test for WebPageTest', e);
      }
    }
  }
};
