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
  runs: 3,
  private: true,
  aftRenderingTime: true,
  location: 'Dulles:Chrome',
  connectivity: 'Cable',
  video: true
});

module.exports = {
  analyzeUrl(url, options) {
    // TODO in the current version we use runs from BT
    options = merge({}, defaultOptions, options);

    var wptClient = new WebPageTest(options.host, options.key);

    options.firstViewOnly = !options.includeRepeatView;

    return wptClient.runTestAsync(url, options)
      .then(function(data) {
        var id = data.data.id;

        return wptClient.getHARDataAsync(id, {})
          .then((har) => {
            return { data, har }
          });
      });
  }
};
