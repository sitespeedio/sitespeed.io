'use strict';

var fs = require('fs'),
  Promise = require('bluebird'),
  log = require('intel').getLogger('plugins.webpagetest.analyzer'),
  WebPageTest = require('webpagetest');

Promise.promisifyAll(fs);
Promise.promisifyAll(WebPageTest.prototype);

module.exports = {
  analyzeUrl(url, wptOptions) {

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
