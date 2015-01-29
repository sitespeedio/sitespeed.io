/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

'use strict';

/**
 * Here are utility methods handling YSlow objects,
 * mostly the component object
 */

var util = require('./util'),
  Stats = require('fast-stats').Stats;

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
        if (headerName.toLowerCase() === 'cache-control') {
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

        } else if (headerName.toLowerCase() === 'expires') {
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
    var self = this;
    components.forEach(function(comp) {
      stats.push(self.getCacheTime(comp));
    });

    return util.getStatisticsObject(stats, 0);
  },

  /**
   * Get the last modification time statistics for
   * all YSlow components.
   */
  getLastModStats: function(components) {
    var stats = new Stats();
    var self = this;
    components.forEach(function(comp) {
      stats.push(self.getTimeSinceLastMod(comp));
    });

    return util.getStatisticsObject(stats, 0);
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

        if (headerName.toLowerCase() === 'last-modified') {
          lastModifiedDate = new Date(response[headerName]);
        } else if (headerName.toLowerCase() === 'date') {
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
   * Summarize the size from multiple components, with an optional type.
   **/
  getSize: function(components, type) {
    return components.filter(function(comp) {
      if (type && comp.type !== type) {
        return false;
      }
      return comp.size !== '-1';
    }).reduce(function(sum, comp) {
      return sum + comp.size;
    }, 0);
  },

  /**
   * Get the number of domains used for YSlow
   * components
   */
  getNumberOfDomains: function(components) {
    var domains = util.aggregate(components,
      function(comp) {
        return util.getHostname(comp.url);
      }
    );

    return Object.keys(domains).length;
  },

  /**
   * Get the size in bytes for a specific domain
   */
  getSizeForDomain: function(domain, components) {
    var hostAndSize = util.aggregate(components,
      function(comp) {
        return util.getHostname(comp.url);
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
    return util.aggregate(components, function(comp) {
      return util.getHostname(comp.url);
    });
  },


  /**
   * Get the number of assets per content type.
   */
  getAssetsPerContentType: function(components) {
    return util.aggregate(components, function(comp) {
      return comp.type;
    });
  },

  /**
   * Get the size in bytes per content type.
   */
  getAssetsSizePerContentType: function(components) {
    return util.aggregate(components,
      function(comp) {
        return comp.type;
      },
      function(comp) {
        return comp.size;
      }
    );
  }

};
