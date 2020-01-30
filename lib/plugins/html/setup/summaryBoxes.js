'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.html');
const h = require('../../../support/helpers');
const toArray = require('../../../support/util').toArray;
const friendlyNames = require('../../../support/friendlynames');
const get = require('lodash.get');

function infoBox(stat, name, formatter) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return _box(stat, name, 'info', formatter, name.replace(/\s/g, ''));
}

function scoreBox(stat, name, formatter) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  return _box(
    stat,
    name,
    h.scoreLabel(stat.median),
    formatter,
    name.replace(/\s/g, '')
  );
}

function timingBox(stat, name, formatter, box) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  let label = 'info';

  if (box === 'timings.firstPaint' || box === 'timings.FirstVisualChange') {
    if (stat.median < 1000) {
      label = 'ok';
    } else if (stat.median < 2000) {
      label = 'warning';
    } else {
      label = 'error';
    }
  } else if (box === 'timings.VisualReadiness') {
    if (stat.median < 500) {
      label = 'ok';
    } else if (stat.median < 1000) {
      label = 'warning';
    } else {
      label = 'error';
    }
  } else if (
    box === 'timings.SpeedIndex' ||
    box === 'timings.PerceptualSpeedIndex'
  ) {
    if (stat.median < 2000) {
      label = 'ok';
    } else if (stat.median < 3000) {
      label = 'warning';
    } else {
      label = 'error';
    }
  } else if (box === 'cpu.longTasksTotalDuration') {
    if (stat.median < 100) {
      label = 'ok';
    } else if (stat.median < 200) {
      label = 'warning';
    } else {
      label = 'error';
    }
  } else if (box === 'cpu.longTasks') {
    if (stat.median === 0) {
      label = 'ok';
    } else if (stat.median < 3) {
      label = 'warning';
    } else {
      label = 'error';
    }
  } else if (box === 'cpu.maxPotentialFid') {
    if (stat.median === 0) {
      label = 'ok';
    } else if (stat.median < 300) {
      label = 'warning';
    } else {
      label = 'error';
    }
  } else if (box === 'cpu.totalBlockingTime') {
    if (stat.median === 0) {
      label = 'ok';
    } else if (stat.median < 500) {
      label = 'warning';
    } else {
      label = 'error';
    }
  }

  return _box(stat, name, label, formatter, name.replace(/\s/g, ''));
}

function pagexrayBox(stat, name, formatter, box) {
  if (typeof stat === 'undefined') {
    return undefined;
  }

  let label = 'info';
  if (box === 'requests.total') {
    if (stat.median < 80) {
      label = 'ok';
    } else if (stat.median < 200) {
      label = 'warning';
    } else {
      label = 'error';
    }
  } else if (box === 'transferSize.total') {
    // in bytes
    if (stat.median < 1000000) {
      label = 'ok';
    } else if (stat.median < 1500000) {
      label = 'warning';
    } else {
      label = 'error';
    }
  } else if (box === 'contentSize.javascript') {
    // in bytes
    if (stat.median < 100000) {
      label = 'ok';
    } else if (stat.median < 150000) {
      label = 'warning';
    } else {
      label = 'error';
    }
  }

  return _box(stat, name, label, formatter, name.replace(/\s/g, ''));
}

function axeBox(stat, name, formatter, url) {
  if (typeof stat === 'undefined') {
    return undefined;
  }
  const label =
    stat.median === 0 ? 'ok' : stat.median < 2 ? 'warning' : 'error';

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

module.exports = function(data, html) {
  if (!data) {
    return [];
  }
  const tools = Object.keys(data);
  const boxes = [];
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

        const metric = get(data, tool + '.summary.' + friendly.summaryPath);
        if (metric !== undefined) {
          boxes.push(boxType(metric, friendly.name, friendly.format, box));
        } else if (friendly.path) {
          const metric = get(data, tool + '.summary.' + friendly.path);
          if (metric !== undefined) {
            boxes.push(boxType(metric, friendly.name, friendly.format, box));
          } else {
            log.verbose('Summary box without any match:' + friendly.name);
          }
        }
      }
    }
  }
  return boxes;
};
