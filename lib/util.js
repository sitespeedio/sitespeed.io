/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Stats = require('fast-stats').Stats,
  crypto = require('crypto'),
  url = require('url');

module.exports = {
  /**
   * Get the cache time in seconds for a YSlow component
   * a.k.a asset.
   *
   *
   * @param {YSLOW.component} comp a component
   * @return {Integer} The cache time in seconds
   */
  getCacheTime: function(comp) {

    // This is how we do it: max-age will always win (HTTP 1.1)
    // If max-age is found use it, else expires
    // if no cache header, return 0
    var maxAgeRegExp = /max-age=(\d+)/,
      expireTime = 0;

    var response = comp.headers.response;
    for (var headerName in response) {
      if (response.hasOwnProperty(headerName)) {

        // Cache-control always wins before Expires
        // in the HTTP spec
        if ('cache-control' === headerName.toLowerCase()) {
          var cacheControl = response[headerName];
          if (cacheControl) {
            if (cacheControl.indexOf('no-cache') !== -1 ||
              cacheControl.indexOf('no-store') !== -1) {
              return 0;
            }
            var matches = cacheControl.match(maxAgeRegExp);
            if (matches) {
              return parseInt(matches[1], 10);
            }
          }

        } else if ('expires' === headerName.toLowerCase()) {
          var expiresDate = new Date(response[headerName]);
          var now = new Date().getTime();
          expireTime = expiresDate.getTime() - now;
        }
      }
    }

    return expireTime;
  },

  /**
   * Get the cache time statistics for
   * all YSlow components.
   */
  getCacheTimeStats: function(components) {
    var stats = new Stats();

    components.forEach(function(comp) {
      stats.push(module.exports.getCacheTime(comp));
    });

    return module.exports.getStatisticsObject(stats, 0);
  },

  /**
   * Get the last modification time statistics for
   * all YSlow components.
   */
  getLastModStats: function(components) {
    var stats = new Stats();

    components.forEach(function(comp) {
      stats.push(module.exports.getTimeSinceLastMod(comp));
    });

    return module.exports.getStatisticsObject(stats, 0);
  },

  /**
   * Get the time in seconds since a component was
   * last modified. If the server doesn't send a
   * last-modified header, the modified time will
   * be set to now.
   *
   *
   * @param the YSlow component
   * @return {Integer} The time in seconds or -1 if unknown
   */
  getTimeSinceLastMod: function(comp) {
    var now = new Date();
    var lastModifiedDate;
    var response = comp.headers.response;
    for (var headerName in response) {
      if (response.hasOwnProperty(headerName)) {

        if ('last-modified' === headerName.toLowerCase()) {
          lastModifiedDate = new Date(response[headerName]);
        } else if ('date' === headerName.toLowerCase()) {
          now = new Date(response[headerName]);
        }
      }
    }

    // TODO how do we define this?
    if (!lastModifiedDate) {
      return -1;
    }

    return (now.getTime() - lastModifiedDate.getTime()) / 1000;
  },

  /**
   * Print seconds as the largest available time.
   * @param {Integer} seconds A number in seconds
   * @return {String} The time in nearest largest definition.
   */
  prettyPrintSeconds: function(seconds) {

    if (seconds === -1) {
      return -1;
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
   * Will turn seconds into the largest avalible time format (minutes, hours etc),
   * add ms to milliseconds and turn bytes into kiloytes.
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
   * Summarize the size from multiple components.
   **/
  getSize: function(components) {
    return components.filter(function(comp) {
      return comp.size !== '-1';
    }).reduce(function(sum, comp) {
      return sum + comp.size;
    }, 0);
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
    return parseFloat(size / 1000) + (0 === (size % 1000) ? '.0' : '') + (showUnit ? ' kb' : '');
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
      // cut it and add a small md5
      name = urlComponents.pathname.replace(/\//g, '-');
      if (name.lastIndexOf('-', 0) === 0) {
        name = name.slice(1, name.length);
      }

      if (name.length > lengthBeforeCut) {
        name = name.slice(0, lengthBeforeCut);
        name = name + crypto.createHash('md5').update(u).digest('hex').substr(0, 5);
      }
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

  /**
   * Get the number of domains used for YSlow
   * components
   */
  getNumberOfDomains: function(components) {
    var self = this;
    var domains = this.aggregate(components,
      function(comp) {
        return self.getHostname(comp.url);
      }
    );

    return Object.keys(domains).length;
  },


  timingMetricsDefinition: {
    'firstPaintTime': 'This is when the first paint happens on the screen, reported by the browser.',
    'serverConnectionTime': 'How long time it takes to connect to the server. Definition: connectEnd - connectStart',
    'domainLookupTime': 'The time it takes to do the DNS lookup. Definition: domainLookupEnd - domainLookupStart',
    'pageLoadTime': 'The time it takes for page to load, from initiation of the pageview (e.g., click on a page link) to load completion in the browser. Important: this is only relevant to some pages, depending on how you page is built. Definition: loadEventStart - navigationStart',
    'pageDownloadTime': 'How long time does it take to download the page (the HTML). Definition: responseEnd - responseStart',
    'serverResponseTime': 'How long time does it take until the server respond. Definition: responseStart - requestStart',
    'domContentLoadedTime': 'The time the browser takes to parse the document and execute deferred and parser-inserted scripts including the network time from the users location to your server. Definition: domContentLoadedEventStart - navigationStart',
    'domInteractiveTime': 'The time the browser takes to parse the document, including the network time from the users location to your server. Definition: domInteractive - navigationStart',
    'redirectionTime': 'Time spent on redirects. Definition: fetchStart - navigationStart',
    'backEndTime': 'The time it takes for the network and the server to generate and start sending the HTML. Definition: responseStart - navigationStart',
    'frontEndTime': 'The time it takes for the browser to parse and create the page. Definition: loadEventStart - responseEnd'
  },

  /**
   * Get the size in bytes for a specific domain
   */
  getSizeForDomain: function(domain, components) {
    var self = this;
    var hostAndSize = this.aggregate(components,
      function(comp) {
        return self.getHostname(comp.url);
      },
      function(comp) {
        return comp.size;
      }
    );

    return hostAndSize[domain];
  },

  /**
   * Get the number of assets per domain.
   */
  getAssetsPerDomain: function(components) {
    var self = this;
    return this.aggregate(components, function(comp) {
      return self.getHostname(comp.url);
    });
  },


  /**
   * Get the number of assets per content type.
   */
  getAssetsPerContentType: function(components) {
    return this.aggregate(components, function(comp) {
      return comp.type;
    });
  },

  /**
   * Get the size in bytes per content type.
   */
  getAssetsSizePerContentType: function(components) {
    return this.aggregate(components,
      function(comp) {
        return comp.type;
      },
      function(comp) {
        return comp.size;
      }
    );
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
      return pageData.browsertime[0].pageData.url;
    } else if (pageData.gpsi) {
      return pageData.gpsi.id;
    } else if (pageData.webpagetest) {
      return pageData.webpagetest.response.data.testUrl;
    }
    return 'undefined';
  },

  getGraphiteURLKey: function(theUrl) {
    var myUrl = url.parse(theUrl);
    var protocol = myUrl.protocol.replace(':', '');
    var hostname = myUrl.hostname;
    var path = myUrl.pathname;


    if (path.indexOf('.') > -1) {
      path = path.replace('.', '_');
    }
    if (path.indexOf('~') > -1) {
      path = path.replace('~', '_');
    }


    if (path === '' || path === '/') {
      return protocol + '.' + hostname + '.slash.';
    }


    var key = protocol + '.' + hostname + '.' + path.replace('/', '.');
    if (key.indexOf('.', key.length - 1) !== -1) {
      return key;
    } else {
      return key + '.';
    }
  }
};