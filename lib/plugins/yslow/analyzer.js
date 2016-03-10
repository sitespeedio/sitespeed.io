'use strict';

/* eslint no-console:0 */

const childProcess = require('child_process'),
  fs = require('fs'),
  phantomPath = require('phantomjs-prebuilt').path,
  path = require('path'),
  merge = require('lodash.merge'),
  Promise = require('bluebird');

Promise.promisifyAll(childProcess);
Promise.promisifyAll(fs);

const defaultOptions = ({
  ruleSet: 'sitespeed.io-desktop',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36'
});

function generatePhantomArgs(url, outputFolder, options) {
  var a = [];

  a.push('--ssl-protocol=any', '--ignore-ssl-errors=yes');

  //if (options.proxy) {
  //  a.push('--proxy', options.urlProxyObject.host, '--proxy-type',
  //    options.urlProxyObject.protocol);
  //}
  // arguments to YSlow
  var scriptPath = path.join(__dirname, 'scripts', 'yslow-3.1.8-sitespeed.js');
  a.push(scriptPath, '-d', '-r', options.ruleSet,
    '--ua', options.userAgent);
  // childArgs.push('-c', '1');
  //if (options.basicAuth) {
  //  a.push('-ba', options.basicAuth);
  //}
  //if (options.cdns) {
  //  a.push('--cdns', options.cdns.join(','));
  //}
  //if (options.requestHeaders) {
  //  a.push('-ch', JSON.stringify(options.requestHeaders));
  //}
  var resultsPath = path.join(outputFolder, 'yslow.json');
  a.push('--file', resultsPath);
  //a.push('-vp', options.viewPort);
  //a.push('--waitScript', options.waitScript);
  a.push(url);
  return a;
}

module.exports = {
  analyzeUrl(url, outputFolder, options) {
    options = merge({}, defaultOptions, options);

    return childProcess.execFileAsync(phantomPath, generatePhantomArgs(url, outputFolder, options), {timeout: 240000})
      .then((stdout, stderr) => {
        if (stdout) {
          console.log('stdout from yslow: ' + stdout);
        }
        if (stderr) {
          console.log('stderr from yslow: ' + stderr);
        }

        if (stderr) {
          throw new Error(stderr);
        }

        return fs.readFileAsync(path.join(outputFolder, 'yslow.json'), 'utf8')
          .then(JSON.parse);
      });
  }
};
