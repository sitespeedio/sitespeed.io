/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var crypto = require('crypto'),
  url = require('url'),
  path = require('path'),
  async = require('async'),
  phantomjsPath = require('phantomjs').path,
  childProcess = require('child_process'),
  fileHelper = require('./fileHelpers'),
  winston = require('winston'),
  sitespeedVersion = require('../../package.json').version,
  browserTimeVersion = require('browsertime/package.json').version,
  moment = require('moment'),
  os = require('os'),
  EOL = require('os').EOL,
  inspect = require('util').inspect;

module.exports = {

    /**
     * Print seconds as the largest available time.
     * @param {Integer} seconds A number in seconds
     * @return {String} The time in nearest largest definition.
     */
    prettyPrintSeconds: function(seconds) {

      if (seconds === -1) {
        return '-1';
      }

      var secondsPerYear = 365 * 24 * 60 * 60,
        secondsPerWeek = 60 * 60 * 24 * 7,
        secondsPerDay = 60 * 60 * 24,
        secondsPerHour = 60 * 60,
        secondsPerMinute = 60,
        sign = (seconds < 0) ? '-' : '';

      if (seconds < 0) {
        seconds = Math.abs(seconds);
      }

      if (seconds / secondsPerYear >= 1) {
        return sign + Math.round(seconds / secondsPerYear) + ' year' + ((Math.round(
          seconds / secondsPerYear) > 1) ? 's' : '');
      } else if (seconds / secondsPerWeek >= 1) {
        return sign + Math.round(seconds / secondsPerWeek) + ' week' + ((Math.round(
          seconds / secondsPerWeek) > 1) ? 's' : '');
      } else if (seconds / secondsPerDay >= 1) {
        return sign + Math.round(seconds / secondsPerDay) + ' day' + ((Math.round(
          seconds / secondsPerDay) > 1) ? 's' : '');
      } else if (seconds / secondsPerHour >= 1) {
        return sign + Math.round(seconds / secondsPerHour) + ' hour' + ((Math.round(
          seconds / secondsPerHour) > 1) ? 's' : '');
      } else if (seconds / secondsPerMinute >= 1) {
        return sign + Math.round(seconds / secondsPerMinute) + ' minute' + ((
          Math.round(seconds / secondsPerMinute) > 1) ? 's' : '');
      } else {
        return sign + seconds + ' second' + ((seconds > 1 || seconds === 0) ? 's' : '');
      }
    },

    /**
     * Get seconds, milliseconds or bytes in a human readable format.
     * Will turn seconds into the largest available time format (minutes, hours etc),
     * add ms to milliseconds and turn bytes into kilobytes.
     */
    getHumanReadable: function(data, value, showUnit) {
      if (data.unit === 'seconds') {
        return this.prettyPrintSeconds(value);
      } else if (data.unit === 'milliseconds') {
        return value + (showUnit ? ' ms' : '');
      } else if (data.unit === 'bytes') {
        return this.getKbSize(value, showUnit);
      } else {
        return value;
      }
    },

    /**
     * If we have a matching rule definition, we will return the
     * matching Bootstrap CSS name, so that the CSS will have the right color.
     */
    getRuleColor: function(rule, value, config) {
      if (config.rules[rule]) {
        var diff = config.rules[rule].warning - config.rules[rule].error;
        if (diff > 0) {
          if (value > config.rules[rule].warning) {
            return 'success';
          } else if (value > config.rules[rule].error) {
            return 'warning';
          }
          return 'danger';
        } else {
          if (value < config.rules[rule].warning) {
            return 'success';
          } else if (value < config.rules[rule].error) {
            return 'warning';
          }
          return 'danger';
        }

      }
      // no matching rule
      return 'info';
    },

    /**
     * Make bytes human readable by turning it into kilobytes and
     * adding the String kb to the result.
     */
    getKbSize: function(size, showUnit) {
      // if we don't have any values in the stats
      if (isNaN(size)) {
        return 0 + ' kb';
      }
      var remainder = size % (size > 100 ? 100 : 10);
      size -= remainder;
      /*eslint-disable yoda */
      return parseFloat(size / 1000) + (0 === (size % 1000) ? '.0' : '') + (showUnit ? ' kb' : '');
      /*eslint-enable yoda */
    },

    select: function(object, keyPath, defaultValue) {
      return keyPath.split('.').reduce(function(result, key) {
        result = result[key];
        return result || defaultValue;
      }, object);
    },

    decodeURIComponent: function(value) {
      try {
        return decodeURIComponent(value);
      } catch (err) {
        return value;
      }
    },

    /**
     * Get the URL as a hash so it can be stored on disk.
     */
    getFileName: function(u) {

      var lengthBeforeCut = 180;
      var urlComponents = url.parse(u);
      var name = urlComponents.pathname;


      // if we only have a slash, just call it the hostname
      if (name === '/') {
        name = urlComponents.hostname;
      } else {
        // replace all the slashes and if the url is too long
        // cut it
        name = urlComponents.pathname.replace(/\//g, '-');
        if (name.lastIndexOf('-', 0) === 0) {
          name = urlComponents.hostname + '-' + name.slice(1, name.length);
        }

        if (name.length > lengthBeforeCut) {
          name = name.slice(0, lengthBeforeCut);
        }
      }

      // add a small md5-sum, taking care of URL:s with request parameters
      if (urlComponents.query) {
        name = name + crypto.createHash('md5').update(u).digest('hex').substr(0, 5);
      }

      // if the URL is https, add a s to make sure it doesn't
      // collide with http URLs
      if (urlComponents.protocol === 'https:') {
        name = 's-' + name;
      }
      return name;
    },

    /**
     * Get the hostname from a URL String
     */
    getHostname: function(u) {
      u = this.decodeURIComponent(u);
      var hostname = u.split('/')[2];
      return (hostname && hostname.split(':')[0]) || '';
    },

    /**
     * Get a usable view of the statistics object. Will format the
     * result to decimals.
     */
    getStatisticsObject: function(stats, decimals) {
      return {
        min: stats.percentile(0).toFixed(decimals),
        max: stats.percentile(100).toFixed(decimals),
        p10: stats.percentile(10).toFixed(decimals),
        p70: stats.percentile(70).toFixed(decimals),
        p80: stats.percentile(80).toFixed(decimals),
        p90: stats.percentile(90).toFixed(decimals),
        p99: stats.percentile(99).toFixed(decimals),
        median: stats.median().toFixed(decimals),
        mean: stats.amean().toFixed(decimals)
      };
    },


    timingMetricsDefinition: {
      'firstPaint': 'This is when the first paint happens on the screen. If the browser support this metric, we use that. Else we use the time of the last non-async script or css from the head.',
      'serverConnectionTime': 'How long time it takes to connect to the server. Definition: connectEnd - connectStart',
      'domainLookupTime': 'The time it takes to do the DNS lookup. Definition: domainLookupEnd - domainLookupStart',
      'pageLoadTime': 'The time it takes for page to load, from initiation of the pageview (e.g., click on a page link) to load completion in the browser. Important: this is only relevant to some pages, depending on how you page is built. Definition: loadEventStart - navigationStart',
      'pageDownloadTime': 'How long time does it take to download the page (the HTML). Definition: responseEnd - responseStart',
      'serverResponseTime': 'How long time does it take until the server respond. Definition: responseStart - requestStart',
      'domContentLoadedTime': 'The time the browser takes to parse the document and execute deferred and parser-inserted scripts including the network time from the users location to your server. Definition: domContentLoadedEventStart - navigationStart',
      'domInteractiveTime': 'The time the browser takes to parse the document, including the network time from the users location to your server. Definition: domInteractive - navigationStart',
      'redirectionTime': 'Time spent on redirects. Definition: fetchStart - navigationStart',
      'backEndTime': 'The time it takes for the network and the server to generate and start sending the HTML. Definition: responseStart - navigationStart',
      'frontEndTime': 'The time it takes for the browser to parse and create the page. Definition: loadEventStart - responseEnd',
      'speedIndex': 'Speed Index calculated with the RUM Speed Index'

    },

    sortWithMaxLength: function(array, sortFunction, maxLength) {
      array.sort(sortFunction);
      if (maxLength) {
        if (array.length > maxLength) {
          array.length = maxLength;
        }
      }
    },

    aggregate: function(array, keyFunction, valueFunction) {
      return array.reduce(function(result, item) {
        var key = keyFunction ? keyFunction(item) : item;
        var value = valueFunction ? valueFunction(item) : 1;

        if (result.hasOwnProperty(key)) {
          result[key] += value;
        } else {
          result[key] = value;
        }
        return result;
      }, {});
    },

    /**
     * Hack to format Google Page Speed Insights result
     *
     **/
    gpsiReplacer: function(args, text) {

      if (args.length === 1) {
        return text.replace('$1', args[0].value);
      } else if (args.length === 2) {
        return text.replace('$1', args[0].value).replace('$2', args[1].value);
      } else if (args.length === 3) {
        return text.replace('$1', args[0].value).replace('$2', args[1].value).replace(
          '$3', args[2].value);
      } else {
        return text;
      }
    },

    /**
     * Get the URL from pageData.
     */
    getURLFromPageData: function(pageData) {
      if (pageData.yslow) {
        return pageData.yslow.originalUrl;
      } else if (pageData.browsertime) {
        return pageData.browsertime.browsertime[0].url;
      } else if (pageData.gpsi) {
        return pageData.gpsi.id;
      } else if (pageData.webpagetest) {
        return pageData.webpagetest.wpt[0].response.data.testUrl;
      }
      return 'undefined';
    },

    getWPTKey: function(locationAndBrowser, connectivity) {
      return '-' + (locationAndBrowser.replace(':', '-') + '-' + connectivity).toLowerCase();
    },

    getGraphiteURLKey: function(theUrl) {

      var join = '.';
      var char = '_';

      var myUrl = url.parse(theUrl);
      var protocol = myUrl.protocol.replace(':', '');
      var hostname = myUrl.hostname.split('.').join(char);
      var pathName = myUrl.pathname;

      // https://github.com/sitespeedio/sitespeed.io/issues/642
      if (pathName === null || pathName === '' || pathName === '/') {
        pathName = 'slash';
      }

      var replace = ['.', '~', ' ', '/'];
      replace.forEach(function(replaceMe) {
        if (pathName.indexOf(replaceMe) > -1) {
          pathName = pathName.split(replaceMe).join(char);
        }
      });

      return protocol + join + hostname + join + pathName;
    },
    fineTuneUrls: function(okUrls, errorUrls, maxPagesToTest, absResultDir, callback) {
      var log = winston.loggers.get('sitespeed.io');
      var downloadErrors = {};

      Object.keys(errorUrls).forEach(function(errorUrl) {
        log.log('error', 'Failed to download ' + errorUrl);
        downloadErrors[errorUrl] = inspect(errorUrls[errorUrl]);
      });

      // limit
      if (maxPagesToTest) {
        if (okUrls.length > maxPagesToTest) {
          okUrls.length = maxPagesToTest;
        }
      }
      if (okUrls.length === 0) {
        log.log('info', 'Didn\'t get any URLs');
        callback(new Error('No URLs to analyze'), okUrls, downloadErrors);
      } else {
        fileHelper.save(path.join(absResultDir, 'data', 'urls.txt'),
          okUrls.join(EOL),
          function(err) {
            callback(err, okUrls, downloadErrors);
          });
      }
    },
    logVersions: function(config, cb) {
      var log = winston.loggers.get('sitespeed.io');

      async.parallel([
          function(callback) {
            childProcess.execFile(config.phantomjsPath || phantomjsPath, ['--version'], {
              timeout: 120000
            }, function(err, stdout) {
              if (err) {
                return callback(err);
              }
              return callback(null, stdout.trim());
            });
          },
          function(callback) {
            childProcess.exec('java -version', {
              timeout: 120000
            }, function(err, stdout, stderr) {
              if (err) {
                return callback(err);
              }
              var matches = stderr.match(/(java version|openjdk version) "(.*)"/);
              var version = (matches && matches.length === 3) ? matches[2] : 'unknown';
              return callback(null, version);
            });
          }
        ],
        function(err, results) {
          if (err) {
            log.error('Error getting versions: %s', inspect(err));
            return cb(err);
          }

          var osVersion = os.platform() + ' ' + os.release();
          var phantomjsVersion = results[0];
          var javaVersion = results[1];

          log.info(
            'OS: \'%s\', Node.js: \'%s\', sitespeed.io: \'%s\', PhantomJS: \'%s\', java: \'%s\', browsertime: \'%s\'',
            osVersion, process.version, sitespeedVersion, phantomjsVersion, javaVersion, browserTimeVersion);
          return cb();
        });

    },

    getContentType: function(contentType) {
      var type = 'unknown';

      if (contentType) {
        if (/html/.test(contentType) || /plain/.test(contentType)) {
          type = 'doc';
        } else if (contentType === 'text/css') {
          type = 'css';
        } else if (/javascript/.test(contentType)) {
          type = 'js';
        } else if (/flash/.test(contentType)) {
            type = 'flash';
        } else if (/image/.test(contentType)) {
            type = 'image';
        } else if (/font/.test(contentType)) {
            type = 'font';
        }
      }
    return type;
  },

      getGenericTitle: function(config) {
          var text = '';

          if (config.url) {
            text = config.url;
          } else if (config.urls) {
            text = config.urls[0];
          } else {
            text = path.basename(config.file);
          }

          var browserInfo = '';
          if (config.browser) {
            browserInfo = config.browser;
            if (config.connection) {
              browserInfo += ' - ' + config.connection;
            }
          }

          var date = moment(config.run.date).format('YYYY-MM-DD HH:mm:ss');

          return text + (browserInfo !== '' ? ' - ' + browserInfo : '') + ' - ' + date;
        },

        isNumber: function(input) {
          return (input - 0) === input && ('' + input).trim().length > 0;
        }

    };
