'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.html');
const h = require('../../../support/helpers');
const toArray = require('../../../support/util').toArray;
const friendlyNames = require('../../../support/friendlynames');
const get = require('lodash.get');

function infoBox(stat, name, formatter, url) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return _box(stat, name, 'info', formatter, url);
}

function scoreBox(stat, name, url) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return _box(stat, name, h.scoreLabel(stat.median), h.noop, url);
}

function axeBox(stat, name, url) {
  if (typeof stat === 'undefined') {
    return undefined;
  }
  const label =
    stat.median === 0 ? 'ok' : stat.median < 2 ? 'warning' : 'error';

  if (stat.median !== undefined) {
    return _box(stat, name, label, h.noop, url);
  }
}

function _box(stat, name, label, formatter, url) {
  const median = formatter ? formatter(stat.median) : stat.median;
  const p90 = formatter ? formatter(stat.p90) : stat.p90;
  return {
    name,
    label,
    median,
    p90,
    url
  };
}

module.exports = function(data, html) {
  if (!data) {
    return [];
  }
  const tools = Object.keys(data);
  const boxes = [];
  for (let tool of tools) {
    const configuredBoxes = toArray(html.summaryBoxes);
    for (let box of configuredBoxes) {
      const [part1, part2] = box.split('.');
      const friendly = get(friendlyNames, tool + '.' + part1 + '.' + part2);
      if (friendly) {
        const boxType =
          tool === 'coach' ? scoreBox : tool === 'axe' ? axeBox : infoBox;
        const metric = get(data, tool + '.summary.' + friendly.summaryPath);
        if (metric !== undefined) {
          boxes.push(boxType(metric, friendly.name, friendly.format));
        } else if (friendly.path) {
          const metric = get(data, tool + '.summary.' + friendly.path);
          if (metric !== undefined) {
            boxes.push(boxType(metric, friendly.name, friendly.format));
          } else {
            log.verbose('Summary box without any match:' + friendly.name);
          }
        }
      }
    }
  }
  return boxes;
};
