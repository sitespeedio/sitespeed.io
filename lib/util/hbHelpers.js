/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var hb = require('handlebars'),
  util = require('./util'),
  yslowUtil = require('./yslowUtil');

module.exports.registerHelpers = function registerHelpers() {

  hb.registerHelper('getHumanReadable', function(box, value, showUnit) {
    return util.getHumanReadable(box, value, showUnit);
  });

  hb.registerHelper('getKbSize', function(value) {
    return util.getKbSize(value);
  });

  hb.registerHelper('getCacheTime', function(comp) {
    return yslowUtil.getCacheTime(comp);
  });

  hb.registerHelper('getTimeSinceLastMod', function(comp) {
    return yslowUtil.getTimeSinceLastMod(comp);
  });

  hb.registerHelper('getPrettyTimeSinceLastMod', function(comp) {
    return util.prettyPrintSeconds(yslowUtil.getTimeSinceLastMod(comp));
  });

  hb.registerHelper('getPrettyCacheTime', function(comp) {
    return util.prettyPrintSeconds(yslowUtil.getCacheTime(comp));
  });

  hb.registerHelper('getPrettyPrintSeconds', function(value) {
    return util.prettyPrintSeconds(value);
  });

  hb.registerHelper('getRuleColor', function(rule, value, config) {
    return util.getRuleColor(rule, value, config);
  });

  hb.registerHelper('decodeURIComponent', function(url) {
    return util.decodeURIComponent(url);
  });

  hb.registerHelper('escapeExpression', function(text) {
    return hb.Utils.escapeExpression(text);
  });

  hb.registerHelper('getFileName', function(url) {
    return util.getFileName(decodeURIComponent(url));
  });

  hb.registerHelper('getPercentage', function(value, total, decimals) {
    return ((value / total) * 100).toFixed(decimals);
  });

  hb.registerHelper('getPrettySizeForDomain', function(domain, components) {
    return util.getKbSize(yslowUtil.getSizeForDomain(domain, components));
  });

  hb.registerHelper('isLowerThan', function(value, limit, options) {
    if (value < limit) {
      return options.fn(this);
    }
  });

  hb.registerHelper('getDecimals', function(value, decimals) {
    return Number(value).toFixed(decimals);
  });

  hb.registerHelper('getPageColumnValue', function(column, page) {
    return util.getHumanReadable(util.select(page, column, ''), util.select(page, column + '.v', 0));
  });

  hb.registerHelper('getHostname', function(url) {
    return util.getHostname(url);
  });

  hb.registerHelper('getTimingMetricsDefinition', function(metric) {
    return util.timingMetricsDefinition[metric] || '';
  });

  hb.registerHelper('getMatchingRuleName', function(id, rules) {
    if (rules.hasOwnProperty(id)) {
      return rules[id].name;
    } else {
      return id;
    }
  });

  hb.registerHelper('prettyOSName', function(name) {
    // Selenium is used when fetching OS names (for BrowserTime)
    // and windows has the following names, change them to
    // just Windows
    var windows = ['xp', 'windows', 'win8', 'win7'];
    if (windows.indexOf(name) > -1) {
      return 'Windows';
    } else {
      return name.substr(0, 1).toUpperCase() + name.substr(1);
    }
  });

  hb.registerHelper('capitalize', function(word) {
    if (word) {
      return word.substr(0, 1).toUpperCase() + word.substr(1);
    } else {
      return '';
    }
  });

  hb.registerHelper('getPlural', function(value) {
    if (value > 1) {
      return 's';
    }
    return '';
  });

  /**
   * Shorten your URL by a maxlength.
   */
  hb.registerHelper('urlShortener', function(url, maxLength) {

    url = decodeURIComponent(url);

    if (url.length > maxLength) {
      return url.substring(0, 25) + '...' + url.substring(url.length + 25 - maxLength);
    }

    return url;
  });


  hb.registerHelper('formatGPSIResult', function(urlBlock) {
    var result = '';

    var format = urlBlock.header.format;
    var args = urlBlock.header.args || [];
    var urls = urlBlock.urls || [];

    result += util.gpsiReplacer(args, format);

    result += '<ul>';
    urls.forEach(function(url) {
      result += '<li>' + util.gpsiReplacer(url.result.args, url.result.format) + '</li>';
    });
    result += '</ul>';

    return result;
  });

  hb.registerHelper('getSiteAggregatedValue', function(siteName, type, metric, aggregates) {
    var value = '';
    aggregates[siteName].forEach(function(a) {
      if (a.id === metric) {
        value = a.stats[type];
      }
    });
    return value;
  });

  hb.registerHelper('getWPTWaterFall', function(run, whichView) {

    // TypeError: Cannot read property 'images' of undefined
    if (Array.isArray(run)) {
      if (run[0][whichView]) {
        return run[0][whichView].images.waterfall;
      } else {
        return 'failingGettingWaterfall';
      }
    } else
    if (run) {
      return run[whichView].images.waterfall;
    } else {
      return 'failingGettingWaterfall';
    }
  });

  hb.registerHelper('getWPTKey', function(location, connectivity) {
    return util.getWPTKey(location, connectivity);
  });

  hb.registerHelper('getColumnsMeta', function(column, columnsMeta, ruleDictionary, type) {
    // TODO major cleanup
    // strip
    if (column.indexOf('rules.') === 0) {
      column = column.replace('rules.', '');
    } else if (column.indexOf('yslow.assets.') === 0) {
      column = column.replace('yslow.assets.', '');
    } else if (column.indexOf('yslow.') === 0) {
      column = column.replace('yslow.', '');
    } else if (column.indexOf('timings.') === 0) {
      column = column.replace('timings.', '');
    } else if (column.indexOf('gpsi.') === 0) {
      column = column.replace('gpsi.', '');
    } else if (column.indexOf('wpt.') === 0) {
      column = column.replace('wpt.', '');
    } else if (column.indexOf('headless.') === 0) {
      column = column.replace('headless.', '');
    }

    // If we have matching in the columns meta data use it
    if (columnsMeta.hasOwnProperty(column)) {
      return columnsMeta[column][type];
    }
    // else it is a rule or BT data, if it's a rule, use the rule title as description
    else if (ruleDictionary.hasOwnProperty(column) && type === 'desc') {
      return ruleDictionary[column].name;
    }
    // if we display number of components returned for a rule
    else if (column.indexOf('.items') > 0) {
      // display short version in title
      if (type === 'title') {
        return column.replace('.items', '') + ' components';
      }
      // and long in description
      else {
        // TODO we need to change the impl of how the ruleDictionary is implemented,
        // now one page needs to be run before it will work
        return column;
      }
    } else if (ruleDictionary.hasOwnProperty(column)) {
      return column + ' score';
    } else {
      return column.replace('.', ' ');
    }
  });

  /*
   * Bootstrap has in a way a complicated handling of defining how many boxes
   * that will be on each row. This function helps us to know if it is time
   * to output the div for a new row.
   */
  hb.registerHelper('bootstrapIsNewRow', function(index, perRow, options) {
    if (index % perRow === 0) {
      return options.fn(this);
    }
  });

  /*
   * Bootstrap has in a way a complicated handling of defining how many boxes
   * that will be on each row. This function helps us to know if it is time
   * to output the div for ending a row.
   */
  hb.registerHelper('bootstrapIsEndRow', function(index, size, perRow, options) {
    if ((index + 1) % perRow === 0) {
      return options.fn(this);
    }

    // Taking care of the case for the last row
    else if (size - (index + 1) === 0) {
      return options.fn(this);
    }

  });

  /*
   * Bootstrap has in a way a complicated handling of defining how many boxes
   * that will be on each row. This function helps us to know how many boxes that
   * will be on this row (or e.g defining how much we will span).
   */
  hb.registerHelper('getBootstrapSpan', function(index, perRow, size) {

    var itemsLastRow = size % perRow;

    // TODO make this generic, now it's hardcoded to 3 per row
    if (size - index <= itemsLastRow) {
      if (itemsLastRow === 2) {
        return 6;
      } else {
        return 12;
      }
    }
    return 4;

  });
};
