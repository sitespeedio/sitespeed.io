'use strict';

const table = require('text-table'),
  flatten = require('lodash.flatten'),
  color = require('cli-color'),
  chunk = require('lodash.chunk'),
  h = require('../../support/helpers'),
  summaryBoxesSetup = require('../html/setup/summaryBoxes'),
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

function getHeader(context, options) {
  const noPages = options.urls.length;
  return drab(
    [
      `${h.plural(noPages, 'page')} analysed for ${h.short(context.name, 30)} `,
      `(${h.plural(options.browsertime.iterations, 'run')}, `,
      `${h.cap(options.browsertime.browser)}/${
        options.mobile ? 'mobile' : 'desktop'
      }/${options.connectivity})`
    ].join('')
  );
}

function getBoxes(metrics, html) {
  return flatten(chunk(summaryBoxesSetup(metrics, html).filter(Boolean), 3));
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
  renderSummary(metrics, context, options) {
    let out = getHeader(context, options);
    let rows = getBoxes(metrics, options.html).map(b => {
      const marker = getMarker(b.label),
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

  renderBriefSummary(metrics, context, options) {
    let out = getHeader(context, options);
    const lines = [],
      scores = [];
    let size = '',
      reqs = '',
      rum = '';
    getBoxes(metrics, options.html).map(b => {
      let c = getColor(b.label),
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
      }
    });
    lines.push(drab('Score: ') + scores.reverse().join(', '));
    lines.push(size);
    lines.push(reqs);
    lines.push(rum);
    options.summary = { out: `${out}\n` + lines.join(' / ') };
  }
};
