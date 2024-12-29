import table from 'text-table';
import clic from 'cli-color';

import { plural, short, cap } from '../../support/helpers/index.js';
import summaryBoxesSetup from '../html/setup/summaryBoxes.js';

const { getStrippedLength, blackBright, bold } = clic;
const tableOptions = {
  stringLength: getStrippedLength
};
const drab = blackBright;

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

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
      `${plural(noPages, 'page')} analysed for ${short(context.name, 30)} `,
      `(${plural(options.browsertime.iterations, 'run')}, `,
      `${cap(options.browsertime.browser)}/${
        options.mobile ? 'mobile' : 'desktop'
      }/${options.connectivity})`
    ].join('')
  );
}

function getBoxes(metrics, html) {
  return chunk(summaryBoxesSetup(metrics, html).filter(Boolean), 3).flat();
}

// foo bar -> fb
function abbr(string_) {
  if (/total|overall/i.test(string_)) return string_.trim();
  return string_.replaceAll(/\w+\s?/g, a => a[0]);
}

function noop(a) {
  return a;
}

export function renderSummary(metrics, context, options) {
  let out = getHeader(context, options);
  let rows = getBoxes(metrics, options.html).map(b => {
    const marker = getMarker(b.label),
      c = getColor(b.label);
    // color.xterm(ansi)(label),
    return [clic[c](marker), clic[c](b.name), bold(b.median)];
  });
  rows.unshift(
    ['', 'Score / Metric', 'Median'],
    ['', '-------------', '------']
  );
  options.summary = { out: `${out}\n` + table(rows, tableOptions) };
}
export function renderBriefSummary(metrics, context, options) {
  let out = getHeader(context, options);
  const lines = [],
    scores = [];
  let size = '',
    reqs = '',
    rum = '';
  getBoxes(metrics, options.html).map(b => {
    let c = getColor(b.label),
      value = b.median,
      name;
    c = clic[c] || noop;
    if (/score$/i.test(b.url)) {
      name = abbr(b.name.replace('score', ''));
      scores.push(c(`${name}:${value}`));
    } else if ('pageSize' === b.url) {
      value = value.replace(' ', ''); // 10 KB -> 10KB
      size = `${value}`;
    } else if (/total requests/i.test(b.name)) {
      reqs = `${value} reqs`;
    }
  });
  lines.push(drab('Score: ') + scores.reverse().join(', '), size, reqs, rum);
  options.summary = { out: `${out}\n` + lines.join(' / ') };
}
