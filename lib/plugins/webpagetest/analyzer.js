'use strict';

var fs = require('fs'),
  Promise = require('bluebird'),
  log = require('intel').getLogger('sitespeedio.plugin.webpagetest'),
  clone = require('lodash.clonedeep'),
  WebPageTest = require('webpagetest');

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
    return wptClient.runTestAsync(urlOrScript, options)
      .then(function(data) {
        var id = data.data.id;
        log.info('Got ' + url + ' analysed from ' + options.host);
        log.verbose('Got JSON from WebPageTest :%:2j', data);

        const promises = [];
        promises.push(wptClient.getHARDataAsync(id, {}));

        const traces = {};
        const views = ['firstView'];
        if (!wptOptions.firstViewOnly) {
          views.push('repeatView');
        }

        views.forEach(function(view) {
          for (var j = 1; j < wptOptions.runs + 1; j++) {
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
            }

            const timelineOptions = {
              run: j,
              repeatView: view === 'repeatView'
            }

            promises.push(
              Promise.join(wptClient.getScreenshotImageAsync(id, screenShotOptions), j, view,
                (result, index, view) => storageManager.writeDataForUrl(result, 'wpt-' + index + '-' + view + '.png', url,
                  'screenshots'))
            );

            promises.push(
              Promise.join(wptClient.getWaterfallImageAsync(id, waterfallOptions), j, view,
                (result, index, view) => {
                  return storageManager.writeDataForUrl(result, 'wpt-waterfall-' + index + '-' + view + '.png', url,
                  'waterfall');
                })
            );

            promises.push(
              Promise.join(wptClient.getWaterfallImageAsync(id, connectionOptions), j, view,
                (result, index, view) => storageManager.writeDataForUrl(result, 'wpt-waterfall-connection-' + index + '-' + view +
                  '.png',
                  url, 'waterfall'))
            );
            if (wptOptions.timeline) {
              promises.push(
                Promise.join(wptClient.getChromeTraceDataAsync(id, timelineOptions), j, view,
                  (result, index, view) => {
                    traces['trace-' + index + '-wpt-' + view] = result
                  })
              );
            }

          }
        })
        return Promise.all(promises).then((result) => {
          const myResult = {
            data: data.data,
            har: result[0]
          }
          myResult.trace = traces;
          return myResult;
        });
      });
  }
};
