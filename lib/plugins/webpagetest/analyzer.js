'use strict';

var fs = require('fs'),
  merge = require('lodash.merge'),
  Promise = require('bluebird'),
  log = require('intel'),
  WebPageTest = require('webpagetest');

Promise.promisifyAll(fs);
Promise.promisifyAll(WebPageTest.prototype);

const defaultOptions = ({
  pollResults: 10,
  timeout: 600,
  includeRepeatView: false,
  private: true,
  aftRenderingTime: true,
  location: 'Dulles:Chrome',
  connectivity: 'Cable',
  video: true
});

module.exports = {
  analyzeUrl(url, options) {
    const wptOptions = merge({}, defaultOptions, options.webpagetest );
    const wptClient = new WebPageTest(wptOptions.host, wptOptions.key);
    wptOptions.firstViewOnly = !wptOptions.includeRepeatView;
    let urlOrScript = url;

    log.info('Sending url ' + url + ' to test on ' + wptOptions.host);
    if (wptOptions.script) {
      urlOrScript = wptOptions.script.split('{{{URL}}}').join(url);
    }
    return wptClient.runTestAsync(urlOrScript, wptOptions)
      .then(function(data) {
        var id = data.data.id;
        log.info('Got ' + url + ' analysed from ' + wptOptions.host);
        log.trace('Got JSON from WebPageTest :%:2j', data);
        return wptClient.getHARDataAsync(id, {})
          .then((har) => {
            return { data: data.data, har }
          });
      });
  }
};
