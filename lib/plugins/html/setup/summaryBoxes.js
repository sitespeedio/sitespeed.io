'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.html');
const toArray = require('../../../support/util').toArray;
const friendlyNames = require('../../../support/friendlynames');
const get = require('lodash.get');
const defaultLimits = require('./summaryBoxesDefaultLimits');
const merge = require('lodash.merge');

function infoBox(stat, name, formatter) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return _box(stat, name, 'info', formatter, name.replace(/\s/g, ''));
}

function scoreBox(stat, name, formatter, box, limits) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  let label = 'info';

  if (limits && limits.green) {
    if (stat.median >= limits.green) {
      label = 'ok';
    } else if (stat.median >= limits.yellow) {
      label = 'warning';
    } else {
      label = 'error';
    }
  }
  return _box(stat, name, label, formatter, name.replace(/\s/g, ''));
}

function timingBox(stat, name, formatter, box, limits) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  let label = 'info';

  if (limits && limits.green) {
    if (stat.median < limits.green) {
      label = 'ok';
    } else if (stat.median < limits.yellow) {
      label = 'warning';
    } else {
      label = 'error';
    }
  }

  return _box(stat, name, label, formatter, name.replace(/\s/g, ''));
}

function pagexrayBox(stat, name, formatter, box, limits) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  let label = 'info';
  if (limits && limits.green) {
    if (stat.median < limits.green) {
      label = 'ok';
    } else if (stat.median < limits.yellow) {
      label = 'warning';
    } else {
      label = 'error';
    }
  }

  return _box(stat, name, label, formatter, name.replace(/\s/g, ''));
}

function axeBox(stat, name, formatter, url, limits) {
  if (typeof stat === 'undefined') {
    return undefined;
  }
  let label = 'info';

  if (limits && limits.green) {
    if (stat.median === limits.green) {
      label = 'ok';
    } else if (stat.median === limits.yellow) {
      label = 'warning';
    } else {
      label = 'error';
    }
  }

  if (stat.median !== undefined) {
    return _box(stat, name, label, formatter, url);
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

module.exports = function (data, html) {
  if (!data) {
    return [];
  }
  const tools = Object.keys(data);
  const boxes = [];

  const limits = merge(defaultLimits, html.summaryBoxesThresholds || {});
  for (let tool of tools) {
    const configuredBoxes = toArray(html.summaryBoxes);
    for (let box of configuredBoxes) {
      // const [part1, part2] = box.split('.');
      const friendly = get(friendlyNames, tool + '.' + box);
      if (friendly) {
        let boxType;
        switch (tool) {
          case 'coach':
            boxType = scoreBox;
            break;
          case 'axe':
            boxType = axeBox;
            break;
          case 'pagexray':
            boxType = pagexrayBox;
            break;
          case 'browsertime':
            boxType = timingBox;
            break;
          default:
            boxType = infoBox;
        }

        const stats = get(data, tool + '.summary.' + friendly.summaryPath);
        const boxLimits = get(limits, box);
        if (stats !== undefined) {
          boxes.push(
            boxType(stats, friendly.name, friendly.format, box, boxLimits)
          );
        } else if (friendly.path) {
          const metric = get(data, tool + '.summary.' + friendly.path);
          if (metric !== undefined) {
            boxes.push(
              boxType(metric, friendly.name, friendly.format, box, boxLimits)
            );
          } else {
            log.verbose('Summary box without any match:' + friendly.name);
          }
        }
      }
    }
  }
  return boxes;
};
