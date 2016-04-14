'use strict';

var fs = require('fs'),
  merge = require('lodash.merge'),
  Promise = require('bluebird'),
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

    // take browsertime default runs first, then override with specific
    // wpt values
    defaultOptions.runs = options.browsertime.iterations;
    const wptOptions = merge({}, defaultOptions, options.webpagetest );
    const wptClient = new WebPageTest(wptOptions.host, wptOptions.key);
    wptOptions.firstViewOnly = !wptOptions.includeRepeatView;

    return wptClient.runTestAsync(url, wptOptions)
      .then(function(data) {
        var id = data.data.id;

        return wptClient.getHARDataAsync(id, {})
          .then((har) => {
            return { data, har }
          });
      });
  }
};
