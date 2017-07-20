'use strict';

const table = require('text-table'),
  flatten = require('lodash.flatten'),
  color = require('cli-color'),
  chunk = require('lodash.chunk'),
  h = require('../../support/helpers'),
  tableOpts = {
    stringLength: color.getStrippedLength
  },
  drab = color.blackBright;

function getMarker(label) {
  return { ok: '√', warning: '!', error: '✗', info: '' }[label] || '';
}

function getColor(label) {
  // ansi = {ok: 150, warning: 230, error: 217, info: ''}[b.label],
  return { ok: 'green', warning: 'yellow', error: 'red', info: 'blackBright' }[
    label
  ];
}

function getHeader(dataCollection, context, options) {
  const noPages = Object.keys(dataCollection.urlPages).length;
  return drab(
    [
      `${h.plural(noPages, 'page')} analyzed for ${h.short(context.name, 30)} `,
      `(${h.plural(options.browsertime.iterations, 'run')}, `,
      `${h.cap(options.browsertime.browser)}/${options.mobile
        ? 'mobile'
        : 'desktop'}/${options.connectivity})`
    ].join('')
  );
}

function getBoxes(dataCollection) {
  return flatten(chunk(dataCollection.getSummaryBoxes().filter(Boolean), 3));
}

// foo bar -> fb
function abbr(str) {
  if (/total|overall/i.test(str)) return str.trim();
  return str.replace(/\w+\s?/g, a => a[0]);
}

function noop(a) {
  return a;
}

module.exports = {
  renderSummary(dataCollection, context, options) {
    let out = getHeader(dataCollection, context, options);
    let rows = getBoxes(dataCollection).map(b => {
      var marker = getMarker(b.label),
        c = getColor(b.label);
      // color.xterm(ansi)(label),
      return [color[c](marker), color[c](b.name), color.bold(b.median)];
    });
    rows.unshift(
      ['', 'Score / Metric', 'Median'],
      ['', '-------------', '------']
    );
    options.summary = { out: `${out}\n` + table(rows, tableOpts) };
  },

  renderBriefSummary(dataCollection, context, options) {
    let out = getHeader(dataCollection, context, options);
    var lines = [],
      scores = [],
      size = '',
      reqs = '',
      rum = '';
    getBoxes(dataCollection).map(b => {
      var c = getColor(b.label),
        val = b.median,
        name;
      c = color[c] || noop;
      if (/score$/i.test(b.url)) {
        name = abbr(b.name.replace('score', ''));
        scores.push(c(`${name}:${val}`));
      } else if ('pageSize' === b.url) {
        val = val.replace(' ', ''); // 10 KB -> 10KB
        size = `${val}`;
      } else if (/total requests/i.test(b.name)) {
        reqs = `${val} reqs`;
      } else if (b.url === 'rumSpeedIndex') {
        name = abbr(b.name);
        rum = color.bold(`${name}: ${val}`);
      }
    });
    lines.push(drab('Score: ') + scores.reverse().join(', '));
    lines.push(size);
    lines.push(reqs);
    lines.push(rum);
    options.summary = { out: `${out}\n` + lines.join(' / ') };
  }
};
